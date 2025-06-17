// services/eventService.js

const fs = require('fs');
const path = require('path');

const eventsPath = path.join(__dirname, '../data/events.json');

function loadEvents() {
    if (!fs.existsSync(eventsPath)) {
        fs.writeFileSync(eventsPath, JSON.stringify({}), 'utf8');
    }
    return JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
}

function saveEvents(events) {
    fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2), 'utf8');
}

function createEvent(eventId, eventData) {
    const events = loadEvents();
    events[eventId] = eventData;
    saveEvents(events);
}

function getEvent(eventId) {
    const events = loadEvents();
    return events[eventId] ?? null;
}

function getAllEvents() {
    return loadEvents();
}

function deleteEvent(eventId) {
    const events = loadEvents();
    delete events[eventId];
    saveEvents(events);
}

module.exports = {
    createEvent,
    getEvent,
    getAllEvents,
    deleteEvent
};
