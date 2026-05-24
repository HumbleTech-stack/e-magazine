/************************************************************
███████████████████████████████████████████████████████████
█               ADMIN FORMS & SUBMISSIONS                  █
█        (Generate Forms & Submit Content)                █
███████████████████████████████████████████████████████████
************************************************************/

function showAdminForm(type) {
  const formContainer = document.getElementById('adminFormContainer');
  const formContent = document.getElementById('formContent');
  
  let form = '';

  switch(type) {
    case 'text':
      form = `
        <h3 style="color: var(--primary); margin-bottom: 15px;">Add Text Article</h3>
        <div style="background: rgba(102, 126, 234, 0.2); border-left: 4px solid var(--primary); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <div style="font-weight: 600; margin-bottom: 5px;"><i class="fas fa-home" style="color: var(--primary); margin-right: 8px;"></i>Destination: HOME Section</div>
          <small style="color: var(--text-light);">This article will appear in the Home section</small>
        </div>
        <div class="form-group">
          <label>Title</label>
          <input type="text" id="textTitle" placeholder="Article title" maxlength="100">
        </div>
        <div class="form-group">
          <label>Content</label>
          <textarea id="textContent" placeholder="Write your article here..." maxlength="1000"></textarea>
        </div>
        <div class="form-group">
          <label>Author</label>
          <input type="text" id="textAuthor" placeholder="Your name" maxlength="50">
        </div>
        <div class="form-group">
          <label>Featured Image(s)</label>
          <input type="file" id="articleImages" accept="image/*" multiple>
          <small style="color: var(--text-light); display: block; margin-top: 8px;">Optional. Select one or more images for the article.</small>
        </div>
        ${buildMetadataFields()}
        <button class="btn btn-primary" style="width: 100%;" onclick="previewArticle('text')">
          <i class="fas fa-eye"></i> Preview & Publish
        </button>
      `;
      break;

    case 'image':
      form = `
        <h3 style="color: var(--primary); margin-bottom: 15px;">Add Picture</h3>
        <div style="background: rgba(245, 87, 108, 0.2); border-left: 4px solid var(--accent); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <div style="font-weight: 600; margin-bottom: 5px;"><i class="fas fa-image" style="color: var(--accent); margin-right: 8px;"></i>Destination: REELS Section</div>
          <small style="color: var(--text-light);">This image will appear in the Reels section</small>
        </div>
        <div class="form-group">
          <label>Image Title</label>
          <input type="text" id="imageTitle" placeholder="Photo title" maxlength="100">
        </div>
        <div class="form-group">
          <label>Upload Image from Device</label>
          <input type="file" id="imageFile" accept="image/*" onchange="previewImage(this)">
          <small style="color: var(--text-light); display: block; margin-top: 8px;">Supported: JPG, PNG, GIF, WebP</small>
        </div>
        <div id="imagePreview" style="display: none; margin: 15px 0; text-align: center;">
          <img id="previewImg" style="max-width: 100%; max-height: 200px; border-radius: 10px;">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="imageDesc" placeholder="Describe your image..." maxlength="500"></textarea>
        </div>
        <div class="form-group">
          <label>Photographer/Credit</label>
          <input type="text" id="imageCredit" placeholder="Photo credit" maxlength="50">
        </div>
        ${buildMetadataFields()}
        <button class="btn btn-primary" style="width: 100%;" onclick="submitContent('image')">
          <i class="fas fa-check"></i> Upload Picture
        </button>
      `;
      break;

    case 'video':
      form = `
        <h3 style="color: var(--primary); margin-bottom: 15px;">Add Video</h3>
        <div style="background: rgba(245, 87, 108, 0.2); border-left: 4px solid var(--accent); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <div style="font-weight: 600; margin-bottom: 5px;"><i class="fas fa-video" style="color: var(--accent); margin-right: 8px;"></i>Destination: REELS Section</div>
          <small style="color: var(--text-light);">This video will appear in the Reels section</small>
        </div>
        <div class="form-group">
          <label>Video Title</label>
          <input type="text" id="videoTitle" placeholder="Video title" maxlength="100">
        </div>
        <div class="form-group">
          <label>Upload Video from Device</label>
          <input type="file" id="videoFile" accept="video/*" onchange="previewVideo(this)">
          <small style="color: var(--text-light); display: block; margin-top: 8px;">Supported: MP4, WebM, Ogg</small>
        </div>
        <div id="videoPreview" style="display: none; margin: 15px 0;">
          <video id="previewVid" style="max-width: 100%; max-height: 200px; border-radius: 10px; background: black;"></video>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="videoDesc" placeholder="Describe your video..." maxlength="500"></textarea>
        </div>
        <div class="form-group">
          <label>Duration (in seconds)</label>
          <input type="number" id="videoDuration" placeholder="e.g., 330" maxlength="10">
        </div>
        ${buildMetadataFields()}
        <button class="btn btn-primary" style="width: 100%;" onclick="submitContent('video')">
          <i class="fas fa-check"></i> Upload Video
        </button>
      `;
      break;

    case 'podcast':
      form = `
        <h3 style="color: var(--primary); margin-bottom: 15px;">Add Podcast</h3>
        <div style="background: rgba(240, 147, 251, 0.2); border-left: 4px solid var(--accent-light); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <div style="font-weight: 600; margin-bottom: 5px;"><i class="fas fa-microphone" style="color: var(--accent-light); margin-right: 8px;"></i>Destination: PODCASTS Section</div>
          <small style="color: var(--text-light);">This podcast will appear in the Podcasts section</small>
        </div>
        <div class="form-group">
          <label>Podcast Title</label>
          <input type="text" id="podcastTitle" placeholder="Podcast episode title" maxlength="100">
        </div>
        <div class="form-group">
          <label>Audio URL</label>
          <input type="url" id="podcastUrl" placeholder="https://example.com/podcast.mp3">
        </div>
        <div class="form-group">
          <label>Or Upload Audio from Device</label>
          <input type="file" id="podcastFile" accept="audio/*" onchange="previewAudio(this)">
          <small style="color: var(--text-light); display: block; margin-top: 8px;">Supported: MP3, WAV, Ogg, M4A</small>
        </div>
        <div id="audioPreview" style="display: none; margin: 15px 0;">
          <audio id="previewAudio" style="width: 100%;" controls></audio>
        </div>
        <div class="form-group">
          <label>Host/Guest</label>
          <input type="text" id="podcastHost" placeholder="Speaker name" maxlength="100">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="podcastDesc" placeholder="What's this episode about..." maxlength="500"></textarea>
        </div>
        <div class="form-group">
          <label>Duration (minutes)</label>
          <input type="text" id="podcastDuration" placeholder="e.g., 45" maxlength="10">
        </div>
        ${buildMetadataFields()}
        <button class="btn btn-primary" style="width: 100%;" onclick="submitContent('podcast')">
          <i class="fas fa-check"></i> Publish Podcast
        </button>
      `;
      break;

    case 'live':
      form = `
        <h3 style="color: var(--primary); margin-bottom: 15px;">Add Live Stream</h3>
        <div style="background: rgba(245, 87, 108, 0.2); border-left: 4px solid var(--accent); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <div style="font-weight: 600; margin-bottom: 5px;"><i class="fas fa-broadcast-tower" style="color: var(--accent); margin-right: 8px;"></i>Destination: HOME Live Frame</div>
          <small style="color: var(--text-light);">This stream will appear in the horizontal Live Now area on the home page.</small>
        </div>
        <div class="form-group">
          <label>Stream Title</label>
          <input type="text" id="liveTitle" placeholder="Live stream title" maxlength="100">
        </div>
        <div class="form-group">
          <label>Live Stream URL</label>
          <input type="url" id="liveUrl" placeholder="YouTube embed URL, livestream URL, or direct video link">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="liveDesc" placeholder="What is live right now?" maxlength="500"></textarea>
        </div>
        ${buildMetadataFields()}
        <button class="btn btn-primary" style="width: 100%;" onclick="submitContent('live')">
          <i class="fas fa-satellite-dish"></i> Publish Live Stream
        </button>
      `;
      break;
  }

  formContent.innerHTML = form;
  formContainer.style.display = 'block';
}

function submitContent(type) {
  let item = {
    id: Date.now(),
    type: type,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  };
  const metadata = getContentMetadata();
  if (!metadata) return;
  Object.assign(item, metadata);

  switch(type) {
    case 'text':
      const title = document.getElementById('textTitle').value.trim();
      const content = document.getElementById('textContent').value.trim();
      const author = document.getElementById('textAuthor').value.trim();
      
      if (!title || !content) {
        alert('Please fill in title and content');
        return;
      }
      
      item.title = title;
      item.content = content;
      item.author = author || 'Anonymous';
      item.icon = 'fas fa-file-alt';
      break;

    case 'image':
      const imgTitle = document.getElementById('imageTitle').value.trim();
      const imgFile = document.getElementById('imageFile').files[0];
      const imgDesc = document.getElementById('imageDesc').value.trim();
      const imgCredit = document.getElementById('imageCredit').value.trim();
      
      if (!imgTitle || !imgFile) {
        alert('Please fill in title and select an image');
        return;
      }
      
      const imgReader = new FileReader();
      imgReader.onload = function(e) {
        item.title = imgTitle;
        item.url = e.target.result;
        item.description = imgDesc;
        item.credit = imgCredit || 'Unknown';
        item.icon = 'fas fa-image';
        
        app.content.image.unshift(item);
        addActivity(item);
        saveStoredData();
        if (typeof renderAllSections === 'function') renderAllSections();
        if (typeof updateActivityFeed === 'function') updateActivityFeed();
        if (typeof renderAdminPostManager === 'function') renderAdminPostManager();
        document.getElementById('adminFormContainer').style.display = 'none';
        alert('Image uploaded successfully!');
      };
      imgReader.readAsDataURL(imgFile);
      return;

    case 'video':
      const vidTitle = document.getElementById('videoTitle').value.trim();
      const vidFile = document.getElementById('videoFile').files[0];
      const vidDesc = document.getElementById('videoDesc').value.trim();
      const vidDuration = document.getElementById('videoDuration').value.trim();
      
      if (!vidTitle || !vidFile) {
        alert('Please fill in title and select a video');
        return;
      }
      
      const vidReader = new FileReader();
      vidReader.onload = function(e) {
        item.title = vidTitle;
        item.url = e.target.result;
        item.description = vidDesc;
        item.duration = vidDuration ? formatDuration(vidDuration) : 'Unknown';
        item.icon = 'fas fa-video';
        
        app.content.video.unshift(item);
        addActivity(item);
        saveStoredData();
        if (typeof renderAllSections === 'function') renderAllSections();
        if (typeof updateActivityFeed === 'function') updateActivityFeed();
        if (typeof renderAdminPostManager === 'function') renderAdminPostManager();
        document.getElementById('adminFormContainer').style.display = 'none';
        alert('Video uploaded successfully!');
      };
      vidReader.readAsDataURL(vidFile);
      return;

    case 'podcast':
      const podTitle = document.getElementById('podcastTitle').value.trim();
      const podUrl = document.getElementById('podcastUrl').value.trim();
      const podFile = document.getElementById('podcastFile').files[0];
      const podHost = document.getElementById('podcastHost').value.trim();
      const podDesc = document.getElementById('podcastDesc').value.trim();
      const podDuration = document.getElementById('podcastDuration').value.trim();
      
      if (!podTitle || (!podUrl && !podFile)) {
        alert('Please fill in title and add an audio URL or audio file');
        return;
      }

      if (podFile) {
        const podReader = new FileReader();
        podReader.onload = function(e) {
          item.title = podTitle;
          item.url = e.target.result;
          item.host = podHost || 'Unknown';
          item.description = podDesc;
          item.duration = podDuration ? `${podDuration} min` : 'Unknown';
          item.icon = 'fas fa-microphone';

          app.content.podcast.unshift(item);
          addActivity(item);
          saveStoredData();
          if (typeof renderAllSections === 'function') renderAllSections();
          if (typeof updateActivityFeed === 'function') updateActivityFeed();
          if (typeof renderAdminPostManager === 'function') renderAdminPostManager();
          document.getElementById('adminFormContainer').style.display = 'none';
          alert('Podcast published successfully!');
        };
        podReader.readAsDataURL(podFile);
        return;
      }
      
      item.title = podTitle;
      item.url = podUrl;
      item.host = podHost || 'Unknown';
      item.description = podDesc;
      item.duration = podDuration ? `${podDuration} min` : 'Unknown';
      item.icon = 'fas fa-microphone';
      break;

    case 'live':
      const liveTitle = document.getElementById('liveTitle').value.trim();
      const liveUrl = document.getElementById('liveUrl').value.trim();
      const liveDesc = document.getElementById('liveDesc').value.trim();

      if (!liveTitle || !liveUrl) {
        alert('Please fill in title and live stream URL');
        return;
      }

      item.title = liveTitle;
      item.url = liveUrl;
      item.description = liveDesc;
      item.icon = 'fas fa-broadcast-tower';
      break;
  }

  app.content[type].unshift(item);
  addActivity(item);
  saveStoredData();
  if (typeof renderAllSections === 'function') renderAllSections();
  if (typeof updateActivityFeed === 'function') updateActivityFeed();
  if (typeof renderAdminPostManager === 'function') renderAdminPostManager();
  document.getElementById('adminFormContainer').style.display = 'none';
  alert('Content published successfully!');
}
