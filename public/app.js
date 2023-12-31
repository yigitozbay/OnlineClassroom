const APP_ID = "f1a86bfcb8c6431e878641473373ef0e";

import { expandVideoFrame,userIdInDisplayFrame} from "./room.js";
import {handleMemberJoined,handleMemberLeft,getMembers} from "./room_rtm.js";


const firestore = firebase.firestore();


let displayFrame = document.getElementById('stream__box');

const servers = {
  iceServers: [
    {
      urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
    },
  ],
  iceCandidatePoolSize: 10,
};


let uid = sessionStorage.getItem('uid');
if(!uid){
  uid = String(Math.floor(Math.random() * 10000))
  sessionStorage.setItem('uid',uid);
}

let displayName = sessionStorage.getItem('name');

const Takeattendance = document.getElementById('attend-btn');
let token = null;
let client ;


export let rtmClient;
export let channel;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString)
let roomId = urlParams.get('room');

if(!roomId){
  roomId = 'main';
}

let localTracks = []; //audio and video stream
let remoteUsers = {};

let localScreenTracks;
let sharingScreen = false;

let joinRoomInit = async () => {

  rtmClient = await AgoraRTM.createInstance(APP_ID);
  await rtmClient.login({uid,token});


  // login 
  await rtmClient.addOrUpdateLocalUserAttributes({'name':displayName}); // 
  //


  channel = await rtmClient.createChannel(roomId);
  await channel.join();

  channel.on('MemberJoined',handleMemberJoined);
  channel.on('MemberLeft',handleMemberLeft);

  getMembers();


  client = AgoraRTC.createClient({mode:'rtc',codec:'vp8'});
  await client.join(APP_ID,roomId,token,uid);
  
  client.on('user-published',handleUserPublished); //event listener
  client.on('user-left', handleUserLeft)

  if(displayName=='Yigit')
  {
      Takeattendance.style.display = 'block';
      Takeattendance.disabled=false;
  }
  else{
      Takeattendance.style.display = 'none';
      Takeattendance.disabled=false;
  }
  
  joinStream();
}


let joinStream = async () => {
  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks({}, {encoderConfig:{ // asks to access 
    //  width:{min:640,ideal:1920,max:1920},
    //  height:{min:480,ideal:1080,max:1080} auto select best cam, for ex ignores cam select virtual cam
  }}); //ask access to mic cam

  let player = `<div class="video__container" id="user-container-${uid}">
                  <div class="video-player" id="user-${uid}"></div>
                </div>`


  document.getElementById('streams__container').insertAdjacentHTML('beforeend',player);//added to DOM
  document.getElementById(`user-container-${uid}`).addEventListener('click',expandVideoFrame);

  localTracks[1].play(`user-${uid}`);//audio 0 video 1
  await client.publish([localTracks[0],localTracks[1]]); // publish to channel so remote users can see 

}

let handleUserPublished = async (user,mediaType) => {

  remoteUsers[user.uid] = user

    await client.subscribe(user, mediaType)

    let player = document.getElementById(`user-container-${user.uid}`)
    if(player === null){
        player = `<div class="video__container" id="user-container-${user.uid}">
                <div class="video-player" id="user-${user.uid}"></div>
            </div>`

    document.getElementById('streams__container').insertAdjacentHTML('beforeend',player);//added to DOM
    document.getElementById(`user-container-${user.uid}`).addEventListener('click',expandVideoFrame);

  }

  if(displayFrame.style.display){
    let videoFrame = document.getElementById(`user-container-${user.uid}`)
    videoFrame.style.height = '100px'
    videoFrame.style.width = '100px'
  }
  

  if(mediaType === 'video'){
      user.videoTrack.play(`user-${user.uid}`) //create video tag and append to dom
  }

  if(mediaType === 'audio'){
      user.audioTrack.play()
  }

}

let handleUserLeft = async (user) => {
  delete remoteUsers[user.uid]
  document.getElementById(`user-container-${user.uid}`).remove();


  if(userIdInDisplayFrame === `user-container-${user.uid}`){
    displayFrame.style.display = null;

    let videoFrames = document.getElementsByClassName('video__container');

    for(let i = 0; videoFrames.length>i; i++) {
      videoFrames[i].style.height ='300px';
      videoFrames[i].style.width ='400px';
    }
  }
}

let toggleMic = async (e) => {

  let button = e.currentTarget;

  if(localTracks[0].muted){
    await localTracks[0].setMuted(false);
    button.classList.add('active');
  }
  else{
    await localTracks[0].setMuted(true);
    button.classList.remove('active');
  }

}

let toggleCamera = async (e) => {

  let button = e.currentTarget;

  if(localTracks[1].muted){
    await localTracks[1].setMuted(false);
    button.classList.add('active');
  }
  else{
    await localTracks[1].setMuted(true);
    button.classList.remove('active');
  }

}

let switchToCamera = async () => {
  let player = `<div class="video__container" id="user-container-${uid}">
                    <div class="video-player" id="user-${uid}"></div>
                 </div>`;
    displayFrame.insertAdjacentHTML('beforeend', player);

    await localTracks[0].setMuted(true);
    await localTracks[1].setMuted(true);

    document.getElementById('mic-btn').classList.remove('active');
    document.getElementById('screen-btn').classList.remove('active');

    localTracks[1].play(`user-${uid}`);//audio 0 video 1
    await client.publish([localTracks[1]]); // already published audio

}

let toggleScreen = async (e) => {

  let screenButton = e.currentTarget;
  let cameraButton = document.getElementById('camera-btn');


  
  if(!sharingScreen){
    sharingScreen = true;

    screenButton.classList.add('active');
    cameraButton.classList.remove('active');
    cameraButton.style.display = 'none';
    

    localScreenTracks = await AgoraRTC.createScreenVideoTrack();
    document.getElementById(`user-container-${uid}`).remove();
    displayFrame.style.display = 'block';

   
    let  player = `<div class="video__container" id="user-container-${uid}">
              <div class="video-player" id="user-${uid}"></div>
          </div>`;
    displayFrame.insertAdjacentHTML('beforeend',player);
    document.getElementById(`user-container-${uid}`).addEventListener('click',expandVideoFrame);

    userIdInDisplayFrame === `user-container-${uid}`;
    localScreenTracks.play(`user-${uid}`);

    await client.unpublish([localTracks[1]]);
    await client.publish([localScreenTracks]);

    let videoFrames = document.getElementsByClassName('video__container');
    for(let i = 0; videoFrames.length>i ; i++ ){

      if(videoFrames[i].id != userIdInDisplayFrame)
      {
        videoFrames[i].style.height = '100px';
        videoFrames[i].style.width = '100px'
      }
    }

  }
  else{
    sharingScreen = false;
    cameraButton.style.display = 'block';
    document.getElementById(`user-container-${uid}`).remove();


    await client.unpublish([localScreenTracks]);
    switchToCamera();
  }//

}




document.getElementById('camera-btn').addEventListener('click',toggleCamera);
document.getElementById('mic-btn').addEventListener('click',toggleMic);
document.getElementById('screen-btn').addEventListener('click',toggleScreen);


joinRoomInit();
