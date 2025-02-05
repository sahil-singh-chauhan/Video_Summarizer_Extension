from flask import request, Flask, jsonify
from flask_restful import Resource, Api
from youtube_transcript_api import YouTubeTranscriptApi
from transformers import T5Tokenizer, T5ForConditionalGeneration
import torch
import re
import textwrap

app = Flask(__name__)
api = Api(app)

# Check for CUDA availability
device = "cuda" if torch.cuda.is_available() else "cpu"

# Load model and tokenizer
model_name = "t5-large"  # Change from t5-3b if running on limited resources
tokenizer = T5Tokenizer.from_pretrained(model_name)
model = T5ForConditionalGeneration.from_pretrained(model_name).to(device)  # Move to device

# Function to fetch subtitles from YouTube
def get_subtitle(video_id):
    transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
    full_text = " ".join([i["text"] for i in transcript_list])
    return full_text
    
def chunk_text(text, max_tokens=400):
    words = text.split()
    chunks = []

    for i in range(0, len(words), max_tokens):
        chunk = " ".join(words[i:i + max_tokens])
        chunks.append(chunk)

    return chunks
# Summarization function
def summarize_text(text, max_tokens=400):
    chunks = chunk_text(text, max_tokens)
    summaries = []

    for chunk in chunks:
        input_text = "summarize and tell only the important points: " + chunk  # Prefix for T5
        input_ids = tokenizer.encode(input_text, return_tensors="pt",max_length = 512, truncation=True).to(device)

        # Generate summary
        summary_ids = model.generate(input_ids, max_length=150,
                                     no_repeat_ngram_size=3,
                                     length_penalty=2.0,
                                     num_beams=8,
                                     early_stopping=True)
        summary1 = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        summaries.append(summary1)

    # Combine summaries of all chunks
    summary = " ".join(summaries)
    return summary
#video_id = "eBkcXERfZO0"  

def extract_vid_id(y_url):
    pattern = r"(?:v=|\/)([0-9A-Za-z_-]{11})"

    # Search for the pattern in the URL
    match = re.search(pattern, y_url)
    
    if match:
        return match.group(1)  # Extracted Video ID
    else:
        return None


# API Resource for handling POST requests (Echo back data)
class HandlingReq(Resource):
    def post(self):
        data = request.get_json()
        return {"received": data}

@app.route("/api/summarize",methods = ["GET"])
def summarize():
        url = request.args.get("youtube_url")
        video_id = extract_vid_id(url)
        full_text = get_subtitle(video_id)
        summary = summarize_text(full_text)
        return jsonify({"summary": summary})
        
# Adding resources to API
api.add_resource(HandlingReq, "/echo")
#api.add_resource(SummarizeVideo, "/")
# Running Flask app
if __name__ == "__main__":
    app.run(debug=True, port = 5000)
