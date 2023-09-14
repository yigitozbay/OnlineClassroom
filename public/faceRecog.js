const video = document.getElementById('video');

const loginButton = document.getElementById('loginButton');
const firestore = firebase.firestore();
Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromUri("./models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  );
  console.log(faceapi);
}

//export let temp = null;


let j =0;
let name = sessionStorage.getItem('name');

async function getLabeledFaceDescriptions() {


  const response = await fetch('./labels.txt');
  const labelsText = await response.text();
  const labels = labelsText.split('\n').map(label => label.trim());
 // const labels = ['Yigit','b'];
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      for (let i = 1; i <= 2; i++) {
//       const img = await faceapi.fetchImage(`//final-project-c28e8.appspot.com/labels/${label}/${i}.png`); //png
        const img = await faceapi.fetchImage(`./labels/${label}/${i}.png`); //png
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}

video.addEventListener("play", async () => {
  const labeledFaceDescriptors = await getLabeledFaceDescriptions();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);

  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {

    const startTime = performance.now(); 

    const detections = await faceapi
      .detectAllFaces(video)
      .withFaceLandmarks()
      .withFaceDescriptors();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    const results = resizedDetections.map((d) => {
      return faceMatcher.findBestMatch(d.descriptor);
    });
    results.forEach((result, i) => {
    /*  const box = resizedDetections[i].detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: result,
      });
      drawBox.draw(canvas);*/

      if(result.label !== 'unknown'){
        console.log("Name:",result.label);
      //  temp = result.label;
        if(!name){
          name = result.label;
          sessionStorage.setItem('name',name);
        }
     /*    const endTime = performance.now(); // Stop measuring time
      const recognitionTime = endTime - startTime;
      console.log("Recognition time:", recognitionTime, "ms");
      if(j == 35)
      {
        console.log("FINISH");
      }
      else{
        j++;
      }*/
        loginButton.style.display = 'block';
        loginButton.disabled=false;
      }
    });

   
  },1000);
});

loginButton.addEventListener('click' , async () => {
  window.location = './classroom.html'
  
})
