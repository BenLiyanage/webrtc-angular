/*
 *  Copyright (c) 2014 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

// Meter class that generates a number correlated to audio volume.
// The meter class itself displays nothing, but it makes the
// instantaneous and time-decaying volumes available for inspection.
// It also reports on the fraction of samples that were at or near
// the top of the measurement range.

var webrtcApp = angular.module('webrtcApp')

webrtcApp.service('soundMeter', ['$rootScope', function($rootScope) {
    this.instant = 0.0;
    this.cumulativeVolumeOutput = 0.0;
    this.noisy = false;
    this.graph = {}
    this.graph['liveView'] = new google.visualization.DataTable()
    this.graphBuffer = 500;
    this.threshold = 0.1;
    this.thisNoise = { 'initialized': true }
    var that = this;
    
    this.graph['liveView'].addColumn('date', 'date')
    this.graph['liveView'].addColumn('number', 'Interesting')
    this.graph['liveView'].addColumn('number', 'Quiet')
    this.graph['liveView'].addRows(this.graphBuffer)
    console.log(this.graph['liveView'].getNumberOfRows())
    
    var errorCallback = function(error) {
        console.log('navigator.getUserMedia error: ', error);
    }
    
    var successCallback = function(stream) {
      // Put variables in global scope to make them available to the browser console.
      window.stream = stream;
      try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            window.audioContext = new AudioContext();
            
            //Set Up Event Listener
            that.script = window.audioContext.createScriptProcessor(2048, 1, 1);
            that.script.onaudioprocess = audioListener
            
            console.log('SoundMeter connecting');
            that.mic = window.audioContext.createMediaStreamSource(stream);
            that.mic.connect(that.script);
            // necessary to make sample run, but should not be.
            that.script.connect(window.audioContext.destination);
            console.log("soundMeter initialized");
      } catch (e) {
            console.log(e)
            alert('Web Audio API not supported.');
      }
    }
    
    var audioListener = function(event) {
        var input = event.inputBuffer.getChannelData(0);
        var i;
        var sum = 0.0;
        for (i = 0; i < input.length; ++i) {
            sum += input[i] * input[i];
        }
        
        that.instant = Math.sqrt(sum / input.length);
        
        if (that.noisy)
        {
            that.cumulativeVolumeOutput+= that.instant
        }
        
        that.graph['liveView'].addRow([new Date(), (that.noisy ? eval(that.instant) : {"v": null}) , (that.noisy ? {"v": null} : eval(that.instant)) ])
        if (that.graph['liveView'].getNumberOfRows() > that.graphBuffer)
        {
            //make sure our array never gets too big.
            that.graph['liveView'].removeRow(0, that.graph['liveView'].length-that.graphBuffer)
        }
        $rootScope.$apply()
    }
    //Initialize the webrtc
    var constraints = window.constraints = { audio: true, video: false };
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    navigator.getUserMedia(constraints, successCallback, errorCallback);
    
}]);