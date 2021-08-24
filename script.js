if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').then(registration => {
    console.log('SW registered');
    console.log(registration);
  }).catch(error=>{
    console.log('SW registration failed, ', error);
  })
}


let allCompleted = false;
let completedAll = document.querySelector('#new-check-mark');
let filter = 'All';

let theme = localStorage.getItem('todo-theme');
let imgTheme = document.querySelector('.theme img');
let imgHero = document.querySelector('.background-image img');


function getTheme(){
  if (theme === null || theme === undefined){
    theme = 'light'
  }  
  
  localStorage.setItem('todo-theme', theme);
}

function loadTheme(){
  let srcTheme = ''
  let srcHero = ''

  if (theme === 'light'){
    srcTheme = './assets/icon-moon.svg';
    srcHero =  './assets/bg-desktop-light.jpg'
  } else {
    srcTheme = './assets/icon-sun.svg';
    srcHero =  './assets/bg-desktop-dark.jpg'
  }

  imgTheme.src = srcTheme;
  imgHero.src = srcHero;

  let body = document.querySelector('body');
  let elements = document.querySelectorAll('div');

  body.classList.add(theme);

  elements.forEach(e => {
    theme === 'dark' &&  e.classList.add(theme)
  })  
}

function setTheme(){
  let srcTheme = ''
  let srcHero = ''
  let oldTheme = theme;

  if (theme === 'light'){
    theme = 'dark'
    srcTheme = './assets/icon-sun.svg';
    srcHero =  './assets/bg-desktop-dark.jpg'
  } else {
    theme = 'light';
    srcTheme = './assets/icon-moon.svg';
    srcHero =  './assets/bg-desktop-light.jpg'
  }
  
  localStorage.setItem('todo-theme', theme);

  imgTheme.src = srcTheme;
  imgHero.src = srcHero;

  let body = document.querySelector('body');
  let elements = document.querySelectorAll('div');

  body.classList.remove(oldTheme);
  body.classList.add(theme);

  elements.forEach(e => {
    theme === 'light' ? 
    e.classList.remove(oldTheme) :
    e.classList.add(theme)
  })

}

function addItem(event){
  event.preventDefault();

  let text = document.querySelector('#todo-input');

  db.collection('todo-items').add({
    text: text.value,
    status: 'active'
  })

  text.value = '';
}

function getItems(){
  db.collection('todo-items').onSnapshot((snapshot) => {
    let items = [];
    snapshot.docs.forEach((doc) =>{
      items.push({
        id: doc.id,
        ...doc.data()
      });
    })   
    generateItems(items);
  });
}

function generateItems(items){
  let itemsHTML = '';

  items.forEach((item) => {
    itemsHTML += 
    `        
      <div class="todo-item">
        <div class="check">
          <div data-id="${item.id}" class="check-mark ${item.status === 'completed' ? "checked": ""}">
            <img src="./assets/icon-check.svg" alt="mark as checked">
          </div>
        </div>
        <div class="todo-text ${item.status === 'completed' ? "checked": ""}">
          ${item.text}
        </div>
      </div>
    `
  });

  document.querySelector('.todo-items').innerHTML = itemsHTML;
  createEventListeners();
}

function createEventListeners(){
  let todoCheckMarks = document.querySelectorAll('.todo-item .check-mark');

  todoCheckMarks.forEach((checkMark) => {
    checkMark.addEventListener('click', () => {
      markCompleted(checkMark.dataset.id,'')
    })
  })
}

function refreshItemsLeft(){
  db.collection('todo-items').onSnapshot(function(){
    let itemsRef = db.collection('todo-items');
    let query = itemsRef.where('status', '==', 'active');

    query.get().then((querySnapshot) => {
      document.querySelector('.items-left').innerHTML = `${querySnapshot.size} item(s) left`;  
    }).catch((error) => {
      console.log('Error querying data,', error);
    })  
  });
}

function markCompleted(id){
  let item = db.collection('todo-items').doc(id);

  item.get().then(function(doc){
    if(doc.exists){      
      let status = doc.data().status;
      if(status === 'active'){
        item.update({
          status: 'completed'
        })  
      } else {
        item.update({
          status: 'active'
        })
      }
    }
  });

  refreshItemsLeft();
}

function markAllCompleted(){
  let status = '';

  if(completedAll){
    status = 'active'
  } else {
    status = 'completed'
  };

  completedAll = !completedAll;

  let items = db.collection('todo-items');

  items.get().then((doc) => {
    doc.forEach((item) => {
      let i = db.collection('todo-items').doc(item.id);
      i.update({
        status: status
      })
    })
  })
}

function showAll(){
  getItems();

  filter = 'All';
  document.querySelector('#all').classList.add('active');
  document.querySelector('#active').classList.remove('active');
  document.querySelector('#completed').classList.remove('active'); 
}

function showActive(){
  let itemsRef = db.collection('todo-items');
  let query = itemsRef.where('status', '==', 'active');

  query.get().then((items) => {
    let list = [];
    items.forEach((doc) => {
        list.push({
          id: doc.id,
          ...doc.data()
        });
      })
      generateItems(list);  
  }).catch((error) => {
    console.log('Error querying data,', error);
  })  

  filter = 'Active';
  document.querySelector('#all').classList.remove('active');
  document.querySelector('#active').classList.add('active');
  document.querySelector('#completed').classList.remove('active');  
}

function showCompleted(){
  let itemsRef = db.collection('todo-items');
  let query = itemsRef.where('status', '==', 'completed');

  query.get().then((items) => {
    let list = [];
    items.forEach((doc) => {
        list.push({
          id: doc.id,
          ...doc.data()
        });
      })
      generateItems(list);  
  }).catch((error) => {
    console.log('Error querying data,', error);
  })  

  filter = 'Completed';
  document.querySelector('#all').classList.remove('active');
  document.querySelector('#active').classList.remove('active');
  document.querySelector('#completed').classList.add('active');
}

function clearCompleted(){
  let itemsRef = db.collection('todo-items');
  let query = itemsRef.where('status', '==', 'completed');  

  query.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) =>{
      doc.ref.delete()
    });
    console.log('To Do List deleted!'); 
  }).catch((error) => {
    console.log('Error querying data,', error);
  }) 
}

getTheme();
loadTheme();
getItems();
refreshItemsLeft();