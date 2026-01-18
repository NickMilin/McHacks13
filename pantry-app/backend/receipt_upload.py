from dotenv import load_dotenv
import requests
import os
import base64
import time
from PIL import Image  


load_dotenv(override=True)
gumloop_api_key = os.getenv('GUMLOOP')

if not gumloop_api_key:
    raise ValueError("GUMLOOP API key not found in environment variables")

def upload_image_to_gumloop(image_path, user_id):
    # Check if file exists
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found: {image_path}")
    
    try:
        with open(image_path, 'rb') as file:
            file_content = base64.b64encode(file.read()).decode('utf-8')
    except Exception as e:
        raise Exception(f"Error reading image file: {str(e)}")
        
    # Get the filename
    file_name = os.path.basename(image_path)
    
    # Prepare the API request
    url = "https://api.gumloop.com/api/v1/upload_file"
    
    payload = {
        "file_name": file_name,
        "file_content": file_content,
        "user_id": user_id
    }
    
    headers = {
        "Authorization": f"Bearer {gumloop_api_key}",
        "Content-Type": "application/json"
    }
    
    # Make the request
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
    except requests.exceptions.Timeout:
        raise Exception("Upload request timed out")
    except requests.exceptions.RequestException as e:
        raise Exception(f"Error uploading file to Gumloop: {str(e)}")
    
    try:
        response_data = response.json()
        file_name = response_data.get("file_name")
        if not file_name:
            raise ValueError("No file_name in upload response")
        return file_name
    except ValueError as e:
        raise Exception(f"Invalid JSON response from upload: {str(e)}") 





def start_pipeline(file_name, user_id, saved_item_id):    
    # Prepare the API request for starting a pipeline with file
    url = "https://api.gumloop.com/api/v1/start_pipeline"
    
    # For pipeline start, the payload should match what the pipeline expects
    # This may vary depending on your pipeline configuration
    payload = {
        "user_id": user_id,
        "saved_item_id": saved_item_id,
        "pipeline_inputs": [
            {
                "input_name": "file_name",
                "value": f"{file_name}"
            }
        ]
    }
    
    headers = {
        "Authorization": f"Bearer {gumloop_api_key}",
        "Content-Type": "application/json"
    }
    
    # Make the request
    print(f"Starting pipeline with file: {file_name}")
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
    except requests.exceptions.Timeout:
        raise Exception("Pipeline start request timed out")
    except requests.exceptions.RequestException as e:
        raise Exception(f"Error starting pipeline: {str(e)}")
    
    try:
        return response.json()
    except ValueError as e:
        raise Exception(f"Invalid JSON response from pipeline start: {str(e)}")

def get_pipeline_data(response, user_id, max_wait_time=300):
    run_id = response.get("run_id")
    if not run_id:
        raise ValueError("No run_id found in pipeline response")
    
    url = f"https://api.gumloop.com/api/v1/get_pl_run?run_id={run_id}&user_id={user_id}"

    headers = {
        "Authorization": f"Bearer {gumloop_api_key}",
    }

    start_time = time.time()
    while True:
        # Check timeout
        if time.time() - start_time > max_wait_time:
            raise TimeoutError(f"Pipeline did not complete within {max_wait_time} seconds")
        
        try:
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            raise Exception(f"Error checking pipeline status: {str(e)}")
        
        try:
            data = response.json()
        except ValueError as e:
            raise Exception(f"Invalid JSON response from pipeline status: {str(e)}")
        
        state = data.get("state")
        if state == "DONE":
            break
        elif state == "FAILED" or state == "ERROR":
            error_msg = data.get("error", "Unknown error")
            raise Exception(f"Pipeline failed with state {state}: {error_msg}")
        
        time.sleep(2)
    
    return data


def run_pipeline(image_path, user_id, saved_item_id):
    # Upload image and start pipeline
    file_name = upload_image_to_gumloop(image_path, user_id)
    pipeline_response = start_pipeline(file_name, user_id, saved_item_id)
    result = get_pipeline_data(pipeline_response, user_id)
    return result.get("outputs").get("reciept_text")
    


if __name__ == "__main__":
    try:
        print("API Key loaded:", "Yes" if gumloop_api_key else "No")
        
        # Configuration
        IMAGE_PATH = "receipt2.jpg"  
        USER_ID = "ACFRzCqhciYjfQxd77vMlTxTMD22"
        SAVED_ITEM_ID = "vezQxjRcmZY43i7KWchyKw"
        
        # Upload file and start the pipeline
        print("Uploading file and starting pipeline...")
        file_name = upload_image_to_gumloop(IMAGE_PATH, USER_ID)
        print(f"File uploaded successfully: {file_name}")
        
        pipeline_call = start_pipeline(file_name, USER_ID, SAVED_ITEM_ID)
        print(f"Pipeline started with run_id: {pipeline_call.get('run_id')}")
        
        result = get_pipeline_data(pipeline_call, USER_ID)

        output = result.get("outputs")
        if output:
            print("\nPipeline output:")
            print(output.get("receipt_text"))
        else:
            print("\nNo output found in result")
            

        print("\nFinal result:")
        print(result)
        print("\nProcess completed successfully!")
        
    except FileNotFoundError as e:
        print(f"Error: {e}")
    except TimeoutError as e:
        print(f"Timeout Error: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()
