import { useEffect } from 'react';

//Custom react Hook, checks the for notification support and asks permission if possible.

function useNotificationPermission() {
  useEffect(() => {
    
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
      
      console.log("Permission to receive notifications has been granted");
    } else if (Notification.permission !== "denied") {
      
      Notification.requestPermission().then(function (permission) {
        
        if (permission === "granted") {
          console.log("Permission to receive notifications has been granted");
        }
      });
    }
  }, []); 
}

export default useNotificationPermission;