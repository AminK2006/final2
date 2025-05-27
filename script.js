let messages = [
    {
        text: "Hey! How's it going?",
        time: "2:30 PM",
        type: "received"
    },
    {
        text: "Pretty good, thanks for asking!",
        time: "2:31 PM",
        type: "sent"
    },
    {
        text: "What are you up to today?",
        time: "2:32 PM",
        type: "received"
    }
];

let config = {
    contactName: "Contact",
    notificationCount: 0
};

let currentEditIndex = -1;
let touchStartX = 0;
let touchStartY = 0;
let isScrolling = false;
let currentMessageEl = null;
let longPressTimer;
let isConfigMode = false;
let tapCount = 0;
let tapTimer = null;

function toggleCheckbox(id) {
    const checkbox = document.getElementById(id);
    checkbox.classList.toggle('checked');
}

function updateContactInfo() {
    document.getElementById('contactName').textContent = config.contactName;
    const notificationEl = document.getElementById('notificationCount');
    notificationEl.textContent = config.notificationCount;
    
    if (config.notificationCount === 0) {
        notificationEl.style.display = 'none';
    } else {
        notificationEl.style.display = 'inline-block';
    }
}

function renderMessages() {
    const container = document.getElementById('messagesContainer');
    container.innerHTML = '';

    messages.forEach((message, index) => {
        if (message.type === 'date') {
            const dateDiv = document.createElement('div');
            dateDiv.className = 'date-separator';
            dateDiv.textContent = message.text;
            container.appendChild(dateDiv);
            return;
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}`;
        
        let heartReaction = '';
        if (message.hasHeart) {
            heartReaction = '<div class="heart-reaction">💙</div>';
        }

        messageDiv.innerHTML = `
            <div class="message-bubble">${message.text}${heartReaction}</div>
            <div class="timestamp">${message.time}</div>
        `;

        messageDiv.addEventListener('touchstart', handleTouchStart);
        messageDiv.addEventListener('touchmove', handleTouchMove);
        messageDiv.addEventListener('touchend', handleTouchEnd);

        container.appendChild(messageDiv);
    });

    scrollToBottom();
}

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isScrolling = false;
    currentMessageEl = e.currentTarget;
}

function handleTouchMove(e) {
    if (!touchStartX || !touchStartY) return;

    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const diffX = touchStartX - touchX;
    const diffY = touchStartY - touchY;

    if (Math.abs(diffY) > Math.abs(diffX)) {
        isScrolling = true;
        return;
    }

    if (Math.abs(diffX) > 10) {
        e.preventDefault();
    }

    if (Math.abs(diffX) > 30 && !isScrolling) {
        const messageEl = currentMessageEl;
        messageEl.classList.add('show-timestamp');
        
        if (messageEl.classList.contains('sent')) {
            messageEl.classList.add('shifted-left');
        } else {
            messageEl.classList.add('shifted-right');
        }
    }
}

function handleTouchEnd(e) {
    if (currentMessageEl) {
        setTimeout(() => {
            currentMessageEl.classList.remove('show-timestamp', 'shifted-left', 'shifted-right');
        }, 2500);
    }

    touchStartX = 0;
    touchStartY = 0;
    isScrolling = false;
    currentMessageEl = null;
}

function showEditPanel() {
    isConfigMode = false;
    showMessageMode();
    currentEditIndex = -1;
    document.getElementById('messageText').value = '';
    document.getElementById('messageTime').value = new Date().toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'});
    document.getElementById('messageSender').value = 'sent';
    document.getElementById('heartReaction').classList.remove('checked');
    document.getElementById('showDate').classList.remove('checked');
    document.getElementById('deleteBtn').style.display = 'none';
    document.getElementById('editPanel').classList.add('show');
}

function showConfigMode() {
    isConfigMode = true;
    document.getElementById('panelTitle').textContent = 'Settings';
    document.getElementById('configContactName').value = config.contactName;
    document.getElementById('configNotificationCount').value = config.notificationCount;
    
    document.getElementById('configSection').style.display = 'flex';
    document.getElementById('configSection2').style.display = 'flex';
    document.getElementById('messageSection').style.display = 'none';
    document.getElementById('messageSection2').style.display = 'none';
    document.getElementById('messageSection3').style.display = 'none';
    document.getElementById('messageSection4').style.display = 'none';
    document.getElementById('messageSection5').style.display = 'none';
    document.getElementById('configBtn').style.display = 'none';
    document.getElementById('deleteBtn').style.display = 'none';
    document.getElementById('saveBtn').textContent = 'Save Settings';
}

function showMessageMode() {
    isConfigMode = false;
    document.getElementById('panelTitle').textContent = currentEditIndex >= 0 ? 'Edit Message' : 'Add Message';
    
    document.getElementById('configSection').style.display = 'none';
    document.getElementById('configSection2').style.display = 'none';
    document.getElementById('messageSection').style.display = 'flex';
    document.getElementById('messageSection2').style.display = 'flex';
    document.getElementById('messageSection3').style.display = 'flex';
    document.getElementById('messageSection4').style.display = 'flex';
    document.getElementById('messageSection5').style.display = 'flex';
    document.getElementById('configBtn').style.display = 'inline-block';
    document.getElementById('saveBtn').textContent = 'Save';
}

function hideEditPanel() {
    document.getElementById('editPanel').classList.remove('show');
}

function editMessage(index) {
    const message = messages[index];
    if (message.type === 'date') return;

    currentEditIndex = index;
    document.getElementById('messageText').value = message.text;
    document.getElementById('messageTime').value = message.time;
    document.getElementById('messageSender').value = message.type;
    
    if (message.hasHeart) {
        document.getElementById('heartReaction').classList.add('checked');
    } else {
        document.getElementById('heartReaction').classList.remove('checked');
    }
    
    document.getElementById('showDate').classList.remove('checked');
    document.getElementById('deleteBtn').style.display = 'block';
    document.getElementById('editPanel').classList.add('show');
}

function deleteMessage() {
    if (currentEditIndex >= 0) {
        messages.splice(currentEditIndex, 1);
        renderMessages();
        hideEditPanel();
    }
}

function scrollToBottom() {
    const container = document.getElementById('messagesContainer');
    container.scrollTop = container.scrollHeight;
}

function exportMessages() {
    const dataStr = JSON.stringify(messages, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'imessage-conversation.json';
    link.click();
    URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', function() {
    updateContactInfo();
    renderMessages();

    document.addEventListener('touchend', function(e) {
        tapCount++;
        
        if (tapCount === 1) {
            tapTimer = setTimeout(() => {
                tapCount = 0;
            }, 500);
        } else if (tapCount === 3) {
            clearTimeout(tapTimer);
            tapCount = 0;
            showEditPanel();
            e.preventDefault();
        }
    });

    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    document.getElementById('editForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (isConfigMode) {
            config.contactName = document.getElementById('configContactName').value.trim() || 'Contact';
            config.notificationCount = parseInt(document.getElementById('configNotificationCount').value) || 0;
            updateContactInfo();
            hideEditPanel();
            return;
        }
        
        const text = document.getElementById('messageText').value.trim();
        const time = document.getElementById('messageTime').value.trim();
        const type = document.getElementById('messageSender').value;
        const hasHeart = document.getElementById('heartReaction').classList.contains('checked');
        const showDate = document.getElementById('showDate').classList.contains('checked');

        if (!text) return;

        const messageData = { 
            text, 
            time, 
            type, 
            hasHeart: hasHeart || undefined
        };

        if (showDate) {
            if (currentEditIndex >= 0) {
                messages.splice(currentEditIndex, 1, { text: time, type: 'date' }, messageData);
            } else {
                messages.push({ text: time, type: 'date' }, messageData);
            }
        } else {
            if (currentEditIndex >= 0) {
                messages[currentEditIndex] = messageData;
            } else {
                messages.push(messageData);
            }
        }

        renderMessages();
        hideEditPanel();
    });

    document.addEventListener('touchmove', function(e) {
        if (e.scale !== 1) { 
            e.preventDefault(); 
        }
    }, { passive: false });

    document.addEventListener('touchstart', function(e) {
        if (e.target.closest('.message-bubble')) {
            longPressTimer = setTimeout(() => {
                const messageEl = e.target.closest('.message');
                const index = Array.from(messageEl.parentNode.children).indexOf(messageEl);
                let messageIndex = 0;
                for (let i = 0; i <= index; i++) {
                    if (!messageEl.parentNode.children[i].classList.contains('date-separator')) {
                        if (i === index) break;
                        messageIndex++;
                    }
                }
                editMessage(messageIndex);
            }, 500);
        }
    });

    document.addEventListener('touchend', function() {
        clearTimeout(longPressTimer);
    });

    document.addEventListener('touchmove', function() {
        clearTimeout(longPressTimer);
    });

    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            exportMessages();
        }
    });
});