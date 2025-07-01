class StyleAgent {
  constructor() {
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    const askAgentBtn = document.getElementById('askAgentBtn');
    const closeAgentBtn = document.getElementById('closeAgentBtn');
    const sendBtn = document.getElementById('sendBtn');
    const agentInput = document.getElementById('agentInput');

    askAgentBtn.addEventListener('click', () => this.openAgentPanel());
    closeAgentBtn.addEventListener('click', () => this.closeAgentPanel());
    sendBtn.addEventListener('click', () => this.sendMessage());
    
    agentInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });

    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
    });
  }

  openAgentPanel() {
    const panel = document.getElementById('agentPanel');
    panel.style.display = 'flex';
    setTimeout(() => panel.classList.add('open'), 10);
  }

  closeAgentPanel() {
    const panel = document.getElementById('agentPanel');
    panel.classList.remove('open');
    setTimeout(() => panel.style.display = 'none', 300);
  }

  sendMessage() {
    const input = document.getElementById('agentInput');
    const message = input.value.trim();
    
    if (message) {
      this.addMessage(message, 'user');
      input.value = '';
      
      setTimeout(() => {
        this.addMessage("I'm still learning! This feature will connect to a local AI model soon.", 'agent');
      }, 500);
    }
  }

  addMessage(text, sender) {
    const conversation = document.getElementById('conversation');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.innerHTML = `<p>${text}</p>`;
    conversation.appendChild(messageDiv);
    conversation.scrollTop = conversation.scrollHeight;
  }

  switchView(view) {
    const buttons = document.querySelectorAll('.view-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const grid = document.getElementById('clothingGrid');
    if (view === 'list') {
      grid.style.gridTemplateColumns = '1fr';
    } else {
      grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
    }
  }
}

const app = new StyleAgent();