(function(window) {
    'use strict';

    const library = {
        isLoaded: false,
        isLoading: false,
        queue: []
    };

    // --- DEPENDENCY LOADING ---
    function loadScript(url, callback) {
        let script = document.createElement("script");
        script.type = "text/javascript";
        script.src = url;
        script.onload = callback;
        document.head.appendChild(script);
    }

    function loadDependencies(callback) {
        if (library.isLoaded) {
            callback();
            return;
        }

        if (library.isLoading) {
            library.queue.push(callback);
            return;
        }

        library.isLoading = true;

        const dependencies = [
            { name: 'jspdf', url: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js' },
            { name: 'html2canvas', url: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js' }
        ];

        let loadedCount = 0;
        const totalDependencies = dependencies.length;

        function onScriptLoad() {
            loadedCount++;
            if (loadedCount === totalDependencies) {
                library.isLoaded = true;
                library.isLoading = false;
                callback();
                library.queue.forEach(cb => cb());
                library.queue = [];
            }
        }

        dependencies.forEach(dep => {
            // Check if the library object exists on the window
            const libObject = dep.name === 'jspdf' ? window.jspdf : window[dep.name];
            if (!libObject) {
                loadScript(dep.url, onScriptLoad);
            } else {
                onScriptLoad();
            }
        });
    }

    // --- CORE PDF GENERATION FUNCTION ---
    function generate(element, options) {
        loadDependencies(() => {
            const { jsPDF } = window.jspdf;
            
            // Default options
            const pdfOptions = {
                filename: 'download.pdf',
                x: 0,
                y: 0,
                html2canvas: {
                    scale: 0.25, // A sensible default
                    useCORS: true
                },
                ...options
            };

            const pdf = new jsPDF();

            pdf.html(element, {
                callback: function(doc) {
                    doc.save(pdfOptions.filename);
                },
                x: pdfOptions.x,
                y: pdfOptions.y,
                html2canvas: pdfOptions.html2canvas
            });
        });
    }

    // Expose the public API
    window.htmlToPdf = {
        generate: generate
    };

})(window);
