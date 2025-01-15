
	// Javascript for scenario
        let enlarged = false;

        function toggleScenario(id) {
            hideAllScenarios();
            document.getElementById(id).classList.toggle('w3-hide');
        }

        function hideAllScenarios() {
            // ... existing code ...
        }

        function toggleFontSize() {
            let elements = document.querySelectorAll('.scenario-text');
            elements.forEach(element => {
                if (enlarged) {
                    element.classList.remove('large-font');
                } else {
                    element.classList.add('large-font');
                }
            });
            enlarged = !enlarged;
        }


// Change background of iframe to white not css default
var iframe = document.getElementsByTagName('iframe')[0];
iframe.style.background = 'white';
iframe.contentWindow.document.body.style.backgroundColor = 'white';

// Get the Sidebar
var mySidebar = document.getElementById("mySidebar");

// Get the DIV with overlay effect
var overlayBg = document.getElementById("myOverlay");

// Toggle between showing and hiding the sidebar, and add overlay effect
function w3_open() {
    if (mySidebar.style.display === 'block') {
        mySidebar.style.display = 'none';
        overlayBg.style.display = "none";
    } else {
        mySidebar.style.display = 'block';
        overlayBg.style.display = "block";
    }
}

// Close the sidebar with the close button
function w3_close() {
    mySidebar.style.display = "none";
    overlayBg.style.display = "none";
}
	
// For accordian
function controlAccordian(id) {
  var x = document.getElementById(id);
  if (x.className.indexOf("w3-show") == -1) {
    x.className += " w3-show";
  } else {
    x.className = x.className.replace(" w3-show", "");
  }
}