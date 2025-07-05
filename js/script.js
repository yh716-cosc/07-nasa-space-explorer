// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Find the button and gallery elements
const getImagesButton = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');

// NASA APOD API base URL and demo API key
const API_URL = 'https://api.nasa.gov/planetary/apod';
const API_KEY = '9CjYysqFtwftql6RFKZJ23z8p46HNZdEL9lMRpks';

// Add a click event to the button
getImagesButton.addEventListener('click', () => {
  // Get the selected start and end dates
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Calculate the difference in days between start and end date
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end - start;
  const diffDays = diffTime / (1000 * 60 * 60 * 24) + 1; // +1 to include both start and end

  // Set the maximum allowed range (30 days)
  const MAX_DAYS = 9;
  if (diffDays > MAX_DAYS) {
    gallery.innerHTML = `<p>Please select a date range of ${MAX_DAYS} days or less.</p>`;
    return;
  }

  // Build the API URL with query parameters
  const url = `${API_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;

  // Fetch data from NASA APOD API
  fetch(url)
    .then(response => response.json())
    .then(data => {
      // Clear the gallery
      gallery.innerHTML = '';

      // Check if we got an array of images
      if (Array.isArray(data)) {
        // Loop through each image and add to the gallery
        data.forEach(item => {
          // Only show images (not videos)
          if (item.media_type === 'image') {
            // Create an image element
            const img = document.createElement('img');
            img.src = item.url;
            img.alt = item.title;
            img.className = 'apod-image';

            // Create a caption
            const caption = document.createElement('p');
            caption.textContent = item.title;

            // Create a container for image and caption
            // Use the same styles as .gallery-item
            const container = document.createElement('div');
            container.className = 'gallery-item';
            container.appendChild(img);
            container.appendChild(caption);

            // Add click event to open modal with details
            container.addEventListener('click', () => {
              openModal(item);
            });

            // Add to the gallery
            gallery.appendChild(container);
          }
        });
      } else {
        // If not an array, show an error message
        gallery.innerHTML = '<p>No images found for this date range.</p>';
      }
    })
    .catch(error => {
      // Show an error message if something goes wrong
      gallery.innerHTML = `<p>Error: ${error.message}</p>`;
    });
});

// Modal functions
// Create modal HTML if it doesn't exist
let modal = document.getElementById('apod-modal');
if (!modal) {
  modal = document.createElement('div');
  modal.id = 'apod-modal';
  modal.className = 'apod-modal';
  modal.innerHTML = `
    <div id="apod-modal-content" class="apod-modal-content">
      <button id="apod-modal-close" class="apod-modal-close">&times;</button>
      <img id="apod-modal-img" class="apod-modal-img" src="" alt="" />
      <h2 id="apod-modal-title"></h2>
      <p id="apod-modal-date" class="apod-modal-date"></p>
      <p id="apod-modal-explanation" class="apod-modal-explanation"></p>
    </div>
  `;
  document.body.appendChild(modal);
}

// Function to open the modal with image details
function openModal(item) {
  // Set modal content
  document.getElementById('apod-modal-img').src = item.hdurl || item.url;
  document.getElementById('apod-modal-img').alt = item.title;
  document.getElementById('apod-modal-title').textContent = item.title;
  document.getElementById('apod-modal-date').textContent = item.date;
  document.getElementById('apod-modal-explanation').textContent = item.explanation;
  modal.style.display = 'flex';
}

// Close modal when clicking the close button or outside the content
modal.addEventListener('click', function(event) {
  if (event.target === modal || event.target.id === 'apod-modal-close') {
    modal.style.display = 'none';
  }
});
