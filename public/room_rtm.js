import {rtmClient,channel} from './app.js';

let names = [];

let link = document.createElement('a');

const Takeattendance = document.getElementById('attend-btn');

export let handleMemberJoined = async (MemberId) => {
   // console.log("new member joined: ",Username);
    addMemberToDom(MemberId);
    let members = await channel.getMembers();
    partipicantNumber(members)

    
}

let addMemberToDom = async (MemberId) => {
 //   let name = sessionStorage.getItem('name');
    let {name} = await rtmClient.getUserAttributesByKeys(MemberId,['name'])



    let membersWrapper = document.getElementById('member__list');
    let memberItem = `<div class="member__wrapper" id="member__${MemberId}__wrapper">
                        <span class="green__icon"></span>
                        <p class="member_name">${name}</p>
                        </div>`;

    membersWrapper.insertAdjacentHTML('beforeend',memberItem);

    attendance(name);


}

let removeMemberToDom = async (MemberId) => {
   // let name = sessionStorage.getItem('name');
    let memberWrapper = document.getElementById(`member__${MemberId}__wrapper`);
    memberWrapper.remove();
}

let partipicantNumber = async (members) => {
    let count = document.getElementById('members__count');
    count.innerText = members.length;
}

export let getMembers = async () => { //get members currently in call
    let members = await channel.getMembers();
    partipicantNumber(members)
    for(let i =0; members.length>i;i++){
        addMemberToDom(members[i]);
    }
}


let leaveChannel = async() => {
    await channel.leave();
    await rtmClient.logout();
}
window.addEventListener('beforeunload',leaveChannel); //buttona basmadan çıkarsa 


export let handleMemberLeft = async (MemberId) => {
    removeMemberToDom(MemberId);
    let members = await channel.getMembers();
    partipicantNumber(members)
}


let attendance = (name) => {
    let data = `${name}\n`;
    names.push(name); // Add the name to the names array
    let final = names.join('\n');
    let blob = new Blob([final], { type: 'text/plain' });
    link.href = URL.createObjectURL(blob);
    link.download = 'result.txt';

};

Takeattendance.addEventListener('click' , async () => {

    link.click();
    
});


document.getElementById('attend-btn').addEventListener('click',Takeattendance); 
