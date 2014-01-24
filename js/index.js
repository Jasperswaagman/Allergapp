/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // `load`, `deviceready`, `offline`, and `online`.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.getElementById('scan').addEventListener('click', this.scan, false);
    },

    // deviceready Event Handler
    //
    // The scope of `this` is the event. In order to call the `receivedEvent`
    // function, we must explicity call `app.receivedEvent(...);`
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

    scan: function() {
        console.log('scanning');
        
        var scanner = cordova.require("com.phonegap.plugins.barcodescanner.BarcodeScanner");

        scanner.scan( function (result) { 

            alert("We got a barcode\n" + 
            "Result: " + result.text + "\n" + 
            "Format: " + result.format + "\n" + 
            "Cancelled: " + result.cancelled);  

           console.log("Scanner result: \n" +
                "text: " + result.text + "\n" +
                "format: " + result.format + "\n" +
                "cancelled: " + result.cancelled + "\n");
            document.getElementById("info").innerHTML = result.text;
            console.log(result);
            /*
            if (args.format == "QR_CODE") {
                window.plugins.childBrowser.showWebPage(args.text, { showLocationBar: false });
            }
            */

        }, function (error) { 
            console.log("Scanning failed: ", error); 
        } );
    },

};

var prefs = {
    getPrefs: function() {
        // If app is used for the first time
        if(typeof localStorage.firstUseFlag === 'undefined' && typeof localStorage.registerComplete === 'undefined') {
            console.log('app is running for the first time');
            localStorage.firstUseFlag = 'false';
            window.location.href = "#profile_create";
        } else {
        // Do nothing
            if(localStorage.getItem("registerComplete") === 'true') {
                localStorage.getItem("userid");
            }
        }
    },
};

// Prevent default submit on form
$('form').submit(function(e) {
    return false;
});

// Actions by user
$('#submitSaveProfile').click(function() {
    db.profileCreate();
});

// Use this var to request data from the db through the db.php script
var url = 'http://allergapp.nl/db.php?';

var db = {
    getAllergyList: function() {
        $.get(url+'case=getAllergyList', function (data) {
            $.each(data, function(k, v) {
                $('#allergy_list').children('.ui-controlgroup-controls').append('<div class="ui-checkbox"><input type="checkbox" name="checkbox[]" id="checkbox-'+v["allergy_id"]+'" value="'+v['allergy_id']+'" class="custom"/><label for="checkbox-'+v["allergy_id"]+'">'+v["allergy"]+'</label></div>');
            });
        $('#allergy_list').children('.ui-controlgroup-controls').trigger('create');
        });
    }, 

    profileCreate: function() {
        $.post(url, $('#profileCreateForm').serialize(),
            function (data) {
                if(data) {
                    // Insert user in db
                    // ffing ugly vars
                    var name = $('#profile_name_create').val();
                    var email = $('#profile_email_create').val();
                    $.get(url+'case=getUserid', { profile_name: name, profile_email: email },
                        function (data) {
                            // If success we need to store the userid in localstorage.
                            localStorage.userid = data[0].user_id;
                            db.updateAllergies(data[0].user_id);
                    });
                    localStorage.registerComplete = 'true';
                    $.mobile.changePage('#succesDialog');
                } 
        });
    },

    updateAllergies: function(id) {
        var ids = $("#profileCreateForm input:checkbox:checked").map( function() {
            return $(this).val();
        }).get();
        $.post(url+'case=insertAllergies', {'ids': ids, 'user_id': id});
    },

    getAllergiesOfUser: function() {
        // Get all ids of the allergies the user has, to compare with scan result
    },
};
