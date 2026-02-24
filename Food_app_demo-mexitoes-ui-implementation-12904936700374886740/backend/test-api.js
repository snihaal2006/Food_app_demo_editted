(async () => {
    console.log("SENDING OTP...");
    const res = await fetch('http://localhost:3001/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '1111122222' })
    });
    const data = await res.json();
    console.log("SEND OTP RESPONSE:", data);

    if (data.demo_otp) {
        console.log("VERIFYING OTP...");
        const vRes = await fetch('http://localhost:3001/api/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: '1111122222', otp: data.demo_otp, name: 'Test' })
        });
        const vData = await vRes.json();
        console.log("VERIFY OTP RESPONSE:", vRes.status, vData);
    }
})();
