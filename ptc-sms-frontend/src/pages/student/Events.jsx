import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Calendar, CheckCircle } from 'lucide-react';
import '../../styles/StudentEvents.css';
import api from '../../services/api';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [registeredEvents, setRegisteredEvents] = useState(new Set());
    
    useEffect(() => {
    const fetchEvents = async () => {
        try {
            const eventsRes = await api.get('/events'); 
            setEvents(eventsRes.data);

            const registeredRes = await api.get('/events/my-registrations'); 
            setRegisteredEvents(new Set(registeredRes.data)); // wrap in Set for correct usage
        } catch (err) {
            console.error(err);
            setError('Failed to fetch events.');
        } finally {
            setLoading(false); // <- stop loading
        }
    };

    fetchEvents();
}, []);




    const handleRegister = async (eventId) => {
        if (registeredEvents.has(eventId)) {
            alert('You are already registered for this event!');
            return;
        }

        try {
            await api.post(`/events/${eventId}/register`);
            setRegisteredEvents(prev => new Set(prev).add(eventId));
            alert('Registration successful! Check your notifications.');
        } catch (err) {
            const msg = err.response?.data?.error || 'Registration failed.';
            alert(msg);
            console.error(err);
        }
    };

    if (loading) return <div className="events-container">Loading events...</div>;
    if (error) return <div className="events-container error-message">{error}</div>;

    return (
        <div className="events-container">
            <h1 className="events-header">Upcoming Activities & Events</h1>
            <p className="events-subtitle">Register to secure your slot and earn participation points.</p>

            {events.length === 0 ? (
                <div className="no-events">No upcoming events currently scheduled. Check back soon!</div>
            ) : (
                <div className="event-list-grid">
                    {events.map(event => {
                        const isRegistered = registeredEvents.has(event.event_id);
                        const eventDate = new Date(event.event_date);
                        const formattedDate = eventDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                        const formattedTime = eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                        // Safe status handling
                        const status = (event.status || 'active').toLowerCase();

                        // Button logic
                        let buttonText = 'Register Now';
                        let buttonDisabled = false;
                        let buttonClass = 'btn-register';

                        switch (status) {
                            case 'tba':
                            case 'cancelled':
                                buttonText = event.status || 'TBA';
                                buttonDisabled = true;
                                buttonClass += ' btn-disabled';
                                break;
                            case 'completed':
                                buttonText = 'Completed';
                                buttonDisabled = true;
                                buttonClass += ' btn-completed';
                                break;
                            case 'active':
                                if (isRegistered) {
                                    buttonText = 'Registered';
                                    buttonDisabled = true;
                                    buttonClass += ' btn-registered';
                                }
                                break;
                            default:
                                break;
                        }

                        return (
                            <div key={event.event_id} className="event-card">
                                {event.image && (
                                    <img src={`${import.meta.env.VITE_API_URL}/uploads/events/${event.image}`} alt={event.title} className="event-image" />
                                )}
                                <h3 className="event-title">{event.title}</h3>
                                <div className="event-details">
                                    <p><Calendar size={16} /> Date: <strong>{formattedDate}</strong></p>
                                    <p><Clock size={16} /> Time: <strong>{formattedTime}</strong></p>
                                    <p><MapPin size={16} /> Location: <strong>{event.location}</strong></p>
                                    <p className="organizer">Organizer: {event.organizer}</p>
                                    <div className={`status-line-wrapper status-line-wrapper-${status}`}>
                                         <p className={`status-label status-${status}`}> Status: {event.status || 'Active'}</p>
                                    </div>
                                </div>
                                <button
                                    className={buttonClass}
                                    onClick={() => handleRegister(event.event_id)}
                                    disabled={buttonDisabled}
                                >
                                    {buttonText === 'Registered' ? <><CheckCircle size={18} /> {buttonText}</> : buttonText}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Events;
