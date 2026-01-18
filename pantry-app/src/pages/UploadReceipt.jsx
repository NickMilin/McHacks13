import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Camera,
  FileImage,
  Check,
  X,
  Loader2,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { pantryFirebase } from "@/lib/pantryFirebase";
import { pantryApi } from "@/lib/api";
import { categoryLabels } from "@/lib/mockData";

export function UploadReceipt() {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedItems, setExtractedItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Handle file drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processImage(file);
    }
  }, []);

  // Handle file select
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  // Process uploaded image
  const processImage = async (file) => {
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
    };
    reader.readAsDataURL(file);

    // Process receipt through Flask API
    setIsProcessing(true);
    setNotification({ show: false, message: "", type: "success" });

    try {
      const formData = new FormData();
      formData.append("receipt", file);

      const result = await pantryApi.uploadReceipt(formData);

      if (result.success && result.items) {
        setExtractedItems(result.items);
        setSelectedItems(new Set(result.items.map((item) => item.id)));
      } else {
        setNotification({
          show: true,
          message: result.error || "Failed to extract items from receipt",
          type: "error",
        });
        setExtractedItems([]);
      }
    } catch (err) {
      console.error("Receipt processing error:", err);
      setNotification({
        show: true,
        message:
          "Failed to process receipt. Make sure the backend server is running on port 5001.",
        type: "error",
      });
      setExtractedItems([]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle item selection
  const toggleItem = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // Add selected items to pantry
  const handleAddToPantry = async () => {
    if (!user) {
      setNotification({
        show: true,
        message: "You must be logged in",
        type: "error",
      });
      return;
    }

    const itemsToAdd = extractedItems.filter((item) =>
      selectedItems.has(item.id),
    );
    if (itemsToAdd.length === 0) {
      setNotification({
        show: true,
        message: "No items selected",
        type: "error",
      });
      return;
    }

    setIsAdding(true);
    try {
      // Add each item to Firebase
      for (const item of itemsToAdd) {
        await pantryFirebase.addItem(user.uid, {
          name: item.name,
          quantity: item.quantity,
          unit: item.unit || "",
          category: item.category || "other",
          expiryDate: null,
        });
      }

      setNotification({
        show: true,
        message: `Successfully added ${itemsToAdd.length} item${itemsToAdd.length !== 1 ? "s" : ""} to your pantry!`,
        type: "success",
      });

      // Reset state
      setUploadedImage(null);
      setExtractedItems([]);
      setSelectedItems(new Set());
    } catch (error) {
      setNotification({
        show: true,
        message: `Error adding items: ${error.message}`,
        type: "error",
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Reset upload
  const handleReset = () => {
    setUploadedImage(null);
    setExtractedItems([]);
    setSelectedItems(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Scan Receipt</h1>
        <p className="text-muted-foreground">
          Upload a photo of your grocery receipt to automatically add items to
          your pantry
        </p>
      </div>

      {/* Notification */}
      {notification.show && (
        <Card
          className={
            notification.type === "error"
              ? "border-red-200 bg-red-50"
              : "border-green-200 bg-green-50"
          }
        >
          <CardContent className="pt-6">
            <p
              className={
                notification.type === "error"
                  ? "text-sm text-red-800"
                  : "text-sm text-green-800"
              }
            >
              {notification.message}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Receipt</CardTitle>
            <CardDescription>
              Drag and drop or click to upload your receipt image
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!uploadedImage ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer
                  ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
                `}
                onClick={() => document.getElementById("file-input").click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Drop your receipt here</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      or click to browse files
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <FileImage className="h-4 w-4" />
                    <span>PNG, JPG, HEIC up to 10MB</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border">
                  <img
                    src={uploadedImage}
                    alt="Uploaded receipt"
                    className="w-full max-h-96 object-contain bg-muted"
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                        <p className="mt-2 font-medium">
                          Processing receipt...
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Extracting items with OCR
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Remove image button */}
                  {!isProcessing && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleReset}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex-1"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Start Over
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.getElementById("file-input").click()
                    }
                    className="flex-1"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Upload Different Image
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Extracted Items */}
        <Card>
          <CardHeader>
            <CardTitle>Extracted Items</CardTitle>
            <CardDescription>
              {extractedItems.length > 0
                ? `Found ${extractedItems.length} items. Select which ones to add to your pantry.`
                : "Upload a receipt to see extracted items here"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {extractedItems.length > 0 ? (
              <div className="space-y-4">
                {/* Select All / None / Clear */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedItems(new Set(extractedItems.map((i) => i.id)))
                    }
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedItems(new Set())}
                  >
                    Select None
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Clear All
                  </Button>
                </div>

                {/* Items List */}
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {extractedItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                        ${selectedItems.has(item.id) ? "border-primary bg-primary/5" : "hover:bg-muted"}
                      `}
                    >
                      <div
                        className={`
                        w-5 h-5 rounded border-2 flex items-center justify-center
                        ${selectedItems.has(item.id) ? "bg-primary border-primary" : "border-muted-foreground"}
                      `}
                      >
                        {selectedItems.has(item.id) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} {item.unit}
                        </p>
                      </div>
                      <Badge variant={item.category}>
                        {categoryLabels[item.category] || item.category}
                      </Badge>
                    </div>
                  ))}
                </div>

                {/* Add to Pantry Button */}
                <Button
                  onClick={handleAddToPantry}
                  disabled={selectedItems.size === 0 || isAdding}
                  className="w-full"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Items...
                    </>
                  ) : (
                    `Add ${selectedItems.size} Items to Pantry`
                  )}
                </Button>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <FileImage className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No items extracted yet</p>
                <p className="text-sm">Upload a receipt to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📸 Tips for Best Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Ensure good lighting and focus
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Capture the entire receipt in frame
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Flatten out any wrinkles or folds
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Use a contrasting background
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
