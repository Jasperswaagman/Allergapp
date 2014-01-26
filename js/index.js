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
// global vars
var url = 'http://allergapp.nl/db.php?';
var allergyList = JSON.parse(localStorage.getItem('userAllergies'));
var isAllergic = 0;

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
};

var prefs = {
    getPrefs: function() {
        // If app is used for the first time
        if(typeof localStorage.registerComplete === 'undefined') {
            console.log('user is not registered yet');
            window.location.href = "#profile_create";
        } else {
        // Do nothing
        }
    db.getAllergyList();
    db.getAllergiesOfUser();
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

$('#scan').click(function() {
    db.getAllergiesOfUser();
    var scanner = cordova.require("com.phonegap.plugins.barcodescanner.BarcodeScanner");
    scanner.scan( function (result) { 
        // Get list of allergies the product has
        $.get(url+'case=getProductAllergies', {'ean_code': result.text}, function(data) {
            // On success compare the allergy_ids with the user his allergies
            $.each(data, function(index, value) {
                $.each(value, function(i, v) {
                    // If id is present in the allergyList object, set isAllergic to 1.
                    $.each(JSON.parse(localStorage.getItem('userAllergies')), function (obj, val) {
                        console.log('val='+val['allergy_id']);
                        if(v ==  val['allergy_id']) {
                            isAllergic = 1;
                        }
                    });
                });
            });
            
            if(isAllergic == 1) {
                alert('Je mag dit niet hebben :(');
            } else {
                alert('Je mag dit wel hebben :)');
            } 
            isAllergic = 0;
        }).fail(function() {
            alert('Product komt niet voor in de database');
        });
    }, function (error) { 
        console.log("Scanning failed: ", error); 
    }); 
});

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
                    $.mobile.changePage('#succesDialog', {role: 'dialog'});
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
        // Get all ids of the allergies the user has and save them in localStorage.
        $.get(url+'case=getUserAllergies', {'user_id': localStorage.userid}, function(data) {
            localStorage.userAllergies = JSON.stringify(data);
        });
    },
};
