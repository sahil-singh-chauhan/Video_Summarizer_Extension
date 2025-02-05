chrome.runtime.onInstalled.addListener(() => {
    console.log("YouTube Summarizer Extension installed.");
  });
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchSummary") {
      const youtubeUrl = request.youtubeUrl;
      // Call the backend API endpoint. Make sure the URL and port match your Flask app.
      fetch(`http://127.0.0.1:5000/api/summarize?youtube_url=${encodeURIComponent(youtubeUrl)}`)
        .then(response => response.json())
        .then(data => {
          sendResponse({ summary: data.summary });
        })
        .catch(error => {
          console.error("Error fetching summary:", error);
          sendResponse({ summary: "Error fetching summary." });
        });
      // Return true to indicate that we will send a response asynchronously.
      return true;
    }
  });
  