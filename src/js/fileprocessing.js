/* eslint-disable */
function processFile(e) {
    e.preventDefault();

    var fileInput = document.getElementById('file');
    var api_key = document.getElementById('api-key').value;
    if (!fileInput.files.length) {
        alert('Please select a file!');
        return;
    }
    if (!api_key) {
        alert('Please enter an API key!');
        return;
    }
    var service_url = metaguideXtmlUrl + "?api-key=" + api_key;
    var file = fileInput.files[0];
    // Get the label and progress bar elements
    var progressLabel = document.getElementById('progresslabel');
    var progressBar = document.getElementById('progressbar');
    var start = new Date().getTime();

    var zip = new JSZip();
    progressLabel.innerText = "Unpacking EPUB";

    zip.loadAsync(file)
        .then(function (zip) {

            var newZip = new JSZip();

            progressLabel.innerText = "Processing EPUB";

            // get a list of all HTML or XHTML files in the ZIP
            var htmlFiles = Object.keys(zip.files)
                .filter(function
                    (filename) {
                    return filename.endsWith('.html') || filename.endsWith('.xhtml') || filename.endsWith('.htm');
                });


            progressBar.max = Object.keys(zip.files).length + htmlFiles.length;

            progressLabel.innerText = "Preparing html/xhtml files for processing";

            // create an array of promises, one for each HTML file
            var promises = htmlFiles.map(function (filename) {
                return zip.file(filename).async('blob')
                    .then(function (file) {
                        progressLabel.innerText = "Sending " + filename + " to the server";
                        progressBar.value++;

                        // create a FormData object
                        var formData = new FormData();
                        formData.append('file', file, filename);
                        // set the Content-Type header manually
                        formData.set('Content-Type', 'application/xhtml+xml');
                        // submit the HTML file to the api application
                        return $.ajax({
                            type: 'POST',
                            url: service_url,
                            data: formData,
                            processData: false,
                            contentType: false,
                            complete: function (response) {
                                progressLabel.innerText = "Receiving " + filename;
                                newZip.file(filename, response.responseText);
                                progressBar.value++;
                            }
                        });
                    });
            });
            return Promise.all(promises);
        })
        .then(function () {
            progressLabel.innerText = "Preparing non-html/xhtml files for processing";

            var non_htmlFiles = Object.keys(zip.files)
                .filter(function (filename) {
                    return !filename.endsWith('.html') && !filename.endsWith('.xhtml') && !filename.endsWith('.htm');
                });

            progressLabel.innerText = "Adding non-html/xhtml files to new EPUB";

            non_htmlFiles.forEach(function (filename) {
                progressBar.value++;

                //check if the file is a directory
                if (zip.files[filename].dir) {
                    newZip.folder(filename);
                } else {
                    progressLabel.innerText = "Adding non html/xhtml " + filename + " to new epub";
                    newZip.file(filename, zip.files[filename].async('blob'));
                }
            });


            progressLabel.innerText = "Generating new EPUB";
            // generate the new ZIP file
            return newZip.generateAsync({ type: 'blob' });
        })
        .then(function (content) {
            progressLabel.innerText = "Saving new EPUB";

            var a = document.createElement('a');
            a.href = window.URL.createObjectURL(content);
            a.download = file.name;
            a.click();
            var end = new Date().getTime();
            progressBar.value = 0;
            progressBar.max = 0;
            progressLabel.innerText = "Complete! Time taken: " + (end - start) + "ms";
        });
}
/* eslint-enable */
