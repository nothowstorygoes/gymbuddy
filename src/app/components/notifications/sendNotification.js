export default function sendNotification() {
    if(!("Notification" in window))
        alert("This browser doesn't support notifications :(");
    else {

            Notification.requestPermission().then((result => {
                if(result=="granted")
                    {
                        navigator.serviceWorker.ready.then((registration) =>
                        registration.showNotification("Yay! Your slides are ready!",
                    {
                        body: "Your upload was completed successfully.",
                        vibrate: [200,100,200],
                    }))
                    }
            }))
        }
};