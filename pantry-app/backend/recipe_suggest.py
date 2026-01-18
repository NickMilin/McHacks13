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

def start_pipeline(pantry_csv, user_id, saved_item_id):    
    # Prepare the API request for starting a pipeline with file
    url = "https://api.gumloop.com/api/v1/start_pipeline"
    
    # For pipeline start, the payload should match what the pipeline expects
    # This may vary depending on your pipeline configuration
    payload = {
        "user_id": user_id,
        "saved_item_id": saved_item_id,
        "pipeline_inputs": [
            {
                "input_name": "pantry",
                "value": f"{pantry_csv}"
            }
        ]
    }
    
    headers = {
        "Authorization": f"Bearer {gumloop_api_key}",
        "Content-Type": "application/json"
    }
    
    # Make the request
    print(f"Starting pipeline to suggest recipes")
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


def run_pipeline(pantry_csv, user_id, saved_item_id):
    # Upload image and start pipeline
    pipeline_response = start_pipeline(pantry_csv, user_id, saved_item_id)
    result = get_pipeline_data(pipeline_response, user_id)
    return result.get("outputs").get("recipe_json")
    


if __name__ == "__main__":
    try:
        print("API Key loaded:", "Yes" if gumloop_api_key else "No")
        
        # Configuration
        USER_ID = "ACFRzCqhciYjfQxd77vMlTxTMD22"
        SAVED_ITEM_ID = "6rJM8cctyz3xjYTooAMjpe"
        
        pantry_csv = '''
        food_name,quantity,unit,food_category
Jasmine Rice,1,null,Grains
Jasmine Rice,1,null,Grains
Chicken Breast,1,null,Proteins
NY Strip Steak,1,null,Proteins
Onions,1.24,null,Vegetables
Potatoes,1.80,null,Vegetables
Garlic,0.27,null,Vegetables
Bananas,2.52,null,Fruits
Broccoli Crowns,1.29,null,Vegetables
Green Onions,1,null,Vegetables
Sesame Seeds,1,null,Proteins
Eggs,1,null,Proteins
        '''
        pipeline_call = start_pipeline(pantry_csv, USER_ID, SAVED_ITEM_ID)
        print(f"Pipeline started with run_id: {pipeline_call.get('run_id')}")
        
        result = get_pipeline_data(pipeline_call, USER_ID)

        output = result.get("outputs")
        if output:
            print("\nPipeline output:")
            print(output.get("output1"))
            print(output.get("output2"))
            print(output.get("output3"))
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
