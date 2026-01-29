import { useState } from "react";
import { Camera, Upload, X, CheckCircle } from "lucide-react";
import { Button } from "@/app/components/ui/button";

export function CVDiagnoser() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    diagnosis: string;
    confidence: number;
    recommendations: string[];
  } | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      processImage(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const processImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      simulateAnalysis();
    };
    reader.readAsDataURL(file);
  };

  const simulateAnalysis = () => {
    setIsAnalyzing(true);
    setResult(null);
    
    setTimeout(() => {
      setIsAnalyzing(false);
      setResult({
        diagnosis: "White Spot Disease (Ich) Detected",
        confidence: 87.3,
        recommendations: [
          "Increase water temperature to 28-30°C gradually",
          "Add aquarium salt (1 tablespoon per 5 gallons)",
          "Improve aeration and water circulation",
          "Monitor fish closely for 7-10 days",
        ],
      });
    }, 2500);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setResult(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="relative bg-slate-900/40 backdrop-blur-xl border border-teal-500/20 rounded-xl p-6 overflow-hidden">
      {/* Glass effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
            <Camera className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">CV Diagnoser</h3>
            <p className="text-sm text-slate-400">Fish Disease Image Diagnosis</p>
          </div>
        </div>

        {!uploadedImage ? (
          /* Upload Zone */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              isDragging
                ? "border-teal-400 bg-teal-500/10"
                : "border-teal-500/30 bg-slate-800/20"
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-teal-400" />
              </div>
              <div>
                <p className="text-white font-medium mb-1">Drag & Drop Fish Image</p>
                <p className="text-sm text-slate-400">or click to browse</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <Button
                onClick={() => document.getElementById("file-upload")?.click()}
                className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
              >
                Select Image
              </Button>
            </div>
          </div>
        ) : (
          /* Analysis Results */
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={uploadedImage}
                alt="Uploaded fish"
                className="w-full h-48 object-cover"
              />
              <button
                onClick={handleReset}
                className="absolute top-2 right-2 w-8 h-8 bg-slate-900/80 rounded-full flex items-center justify-center hover:bg-slate-800"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Analysis Status */}
            {isAnalyzing && (
              <div className="text-center py-6">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-slate-300">Analyzing image with AI...</p>
              </div>
            )}

            {/* Results */}
            {result && !isAnalyzing && (
              <div className="space-y-4">
                {/* Diagnosis */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-yellow-500/30">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-white mb-1">{result.diagnosis}</div>
                      <div className="text-sm text-slate-400">
                        Confidence: <span className="text-yellow-400 font-medium">{result.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">Treatment Recommendations:</h4>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                        <div className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-1.5"></div>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full border-teal-500/30 text-white hover:bg-teal-500/10"
                >
                  Analyze Another Image
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
