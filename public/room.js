
const memberContainer = document.getElementById('members__container');
const memberButton = document.getElementById('members__button');


let activeMemberContainer = false;

memberButton.addEventListener('click', () => {
  if (activeMemberContainer) {
    memberContainer.style.display = 'none';
  } else {
    memberContainer.style.display = 'block';
  }

  activeMemberContainer = !activeMemberContainer;
});



let displayFrame = document.getElementById('stream__box');
let videoFrames = document.getElementsByClassName('video__container');
export let userIdInDisplayFrame = null;

export let expandVideoFrame = (e) => {

  let child = displayFrame.children[0]; // check for child element in call to add new users
  if(child){
    document.getElementById('streams__container').appendChild(child);
  }
  
  displayFrame.style.display = 'block';
  displayFrame.appendChild(e.currentTarget); // take the current item and add to stream box
  userIdInDisplayFrame = e.currentTarget.id;

  for(let i = 0; videoFrames.length>i ; i++ ){// shrink others when video expanded

    if(videoFrames[i].id != userIdInDisplayFrame)
    {
      videoFrames[i].style.height = '100px';
      videoFrames[i].style.width = '100px'
    }
  }
}

for(let i = 0; videoFrames.length>i ; i++ ){
  videoFrames[i].addEventListener('click',expandVideoFrame);
}

let hideDisplayFrame = () => {
  userIdInDisplayFrame = null;
  displayFrame.style.display = null;

  let child = displayFrame.children[0];

  document.getElementById('streams__container').appendChild(child);
  

  for(let i = 0; videoFrames.length>i; i++) {
    videoFrames[i].style.height ='300px';
    videoFrames[i].style.width ='400px';
  }

}
displayFrame.addEventListener('click',hideDisplayFrame);
