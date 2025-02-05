(function() {
    function createSummarizeButton() {
      // Avoid adding the button more than once.
      if (document.getElementById('yt-summarize-btn')) return;
  
      const button = document.createElement("button");
      button.id = "yt-summarize-btn";
      button.innerText = "Summarize Video";
      
      // Basic styling for visibility.
      Object.assign(button.style, {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        padding: "10px 15px",
        backgroundColor: "#FF0000",
        color: "#FFF",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        zIndex: "1000"
      });
      
      // When clicked, ask the background to fetch a summary.
      button.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "fetchSummary", youtubeUrl: window.location.href }, (response) => {
          if (response && response.summary) {
            alert("Video Summary:\n\n" + response.summary);
          } else {
            alert("Could not fetch summary.");
          }
        });
      });
      
      document.body.appendChild(button);
    }
    
    // Create the button once the page has fully loaded.
    window.addEventListener("load", createSummarizeButton);
  })();
  