import React from 'react';
import QRCode from 'react-qr-code';

const QRCodeDisplay = ({ eventId, eventTitle, qrData, onRefresh }) => {
    const safeValue = qrData && qrData !== "" ? qrData : "No QR Available";

    return (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
            <h2>QR Code for: {eventTitle}</h2>

            <div style={{ background: 'white', padding: '1rem', display: 'inline-block' }}>
                <QRCode value={safeValue} size={200} />
            </div>

            {onRefresh && (
                <div style={{ marginTop: '1rem' }}>
                    <button className="btn-primary" onClick={onRefresh}>
                        Refresh QR Code
                    </button>
                </div>
            )}
        </div>
    );
};

export default QRCodeDisplay;
