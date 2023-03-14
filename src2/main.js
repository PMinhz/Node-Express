function CheckReg(message) {
    if (message.error) {
        document.innerHTML = "<p style='color:red'>  - messages.error </p> ";
    }

    if (message.success) {
        document.innerHTML = "<p style='color:green'>- messages.success </p>";
    }
}