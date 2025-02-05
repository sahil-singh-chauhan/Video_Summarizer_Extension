document.addEventListener('DOMContentLoaded', function() {
    const summarizeButton = document.getElementById('summarizeButton');
    const loaderContainer = document.getElementById('loaderContainer');
    const summaryContainer = document.getElementById('summaryContainer');
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');
    const summaryContent = document.getElementById('summaryContent');
    const videoTitle = document.getElementById('videoTitle');
    const copyButton = document.getElementById('copyButton');
    const copyConfirmation = document.getElementById('copyConfirmation');
  
    summarizeButton.addEventListener('click', function() {
      // Reset display areas
      errorContainer.style.display = 'none';
      summaryContainer.style.display = 'none';
      loaderContainer.style.display = 'block';
      summaryContent.innerText = "";
      videoTitle.innerText = "";
      copyConfirmation.style.display = 'none';
  
      // Query the active tab to get the YouTube URL
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (!tabs || !tabs[0]) {
          loaderContainer.style.display = 'none';
          errorMessage.innerText = "No active tab found.";
          errorContainer.style.display = 'block';
          return;
        }
  
        const youtubeUrl = tabs[0].url;
        // Optionally display the current tab's title as the video title
        videoTitle.innerText = tabs[0].title || "Video Summary";
  
        // Send the URL to the background script
        chrome.runtime.sendMessage({ action: "fetchSummary", youtubeUrl: youtubeUrl }, function(response) {
          loaderContainer.style.display = 'none';
          if (response && response.summary) {
            summaryContent.innerText = response.summary;
            summaryContainer.style.display = 'block';
          } else {
            errorMessage.innerText = "Could not fetch summary.";
            errorContainer.style.display = 'block';
          }
        });
      });
    });
  
    // Copy the summary text when the copy button is clicked
    copyButton.addEventListener('click', function() {
      const textToCopy = summaryContent.innerText;
      if (!textToCopy) return;
      navigator.clipboard.writeText(textToCopy).then(function() {
        copyConfirmation.style.display = 'inline';
        setTimeout(() => {
          copyConfirmation.style.display = 'none';
        }, 2000);
      });
    });
  });
  