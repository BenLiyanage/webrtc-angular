var webrtcApp = angular.module('webrtcApp', [])
    
webrtcApp.controller('noisyTimesController', ['$scope', '$http', '$interval','soundMeter', function($scope, $http, $interval, soundMeter) {
    var initializer;
    $scope.noisyTimes = [];
    $scope.numberToText = "+14103362464"
    $scope.soundMeter = soundMeter
    
    /* If there are any changes to the noisy times, text */
    $scope.$watchCollection('noisyTimes', function() {
        //Prevent the watch from firing on construction
        if ($scope.noisyTimes.length == 0)
            return;
            
        $http({
                method: 'post', 
                url: 'http://cors-anywhere.herokuapp.com/https://api.sendhub.com/v1/messages/',
                params: { 'username': '6506562778', 'api_key': '57e642c3992c52ad08f26f4dced584a17e27588d' }, //its bad practice to put api keys into a javascript file
                data: { 'contacts': [  $scope.numberToText ], 'text':'It\'s so loud in here' }
            })
            .error(function (data, status, headers, config) {  console.log(data, status, headers, config) })
            .success(function (data, status, headers, config) { console.log(data, status, headers, config) })
    }, true)
    
    /* This logic should really all be moved into the soundMeterService, so that it can be basedon the length of a sound after the threshold, as opposed to an interval checkin */
    /* Conceptually the soundMeterService is simply providing a list of 3 noisy times. That we can watch, and act upon in our controller. */
    /* I'm not doing this because my unit tests were built around the controller, and I have not built out unit tests for the service. */
    $scope.detect = function()
    {
        try
        {
            console.log(soundMeter)
            //Detect if it's noisy
            if (soundMeter.instant > soundMeter.threshold && soundMeter.noisy === false)
            {
                console.log("its noisy!");
                soundMeter.noisy = true;
                soundMeter.thisNoise.start = new Date().toLocaleString();
            }
            else if (soundMeter.instant < soundMeter.threshold && soundMeter.noisy === true)
            {
                console.log('it\'s quiet now');
                soundMeter.noisy = false;
                soundMeter.thisNoise.cumulativeVolumeOutput = eval(soundMeter.cumulativeVolumeOutput);
                soundMeter.cumulativeVolumeOutput = 0
                soundMeter.thisNoise.end = new Date().toLocaleString();
                
                //copy the scope by value not reference
                var newNoise = $scope.copyValue(soundMeter.thisNoise);
                console.log(newNoise)
                
                if ($scope.noisyTimes.length === 0)
                {
                    $scope.addNoisyTime(0, newNoise)
                }
                else
                {
                    var addedElement = false;
                    for (var i = 0; i < $scope.noisyTimes.length; i++)
                    {
                        if ($scope.noisyTimes[i].cumulativeVolumeOutput < soundMeter.thisNoise.cumulativeVolumeOutput)
                        {
                            addedElement = true;
                            $scope.addNoisyTime(i, newNoise)
                            break;
                        }
                    }
                    
                    //append to end if we do not have enough things
                    if (addedElement == false && $scope.noisyTimes.length < 3)
                    {
                        $scope.addNoisyTime($scope.noisyTimes.length, newNoise)
                    }
                }
            }
        } catch(err) {
            console.log(err)
        }
    }
    initializer = $interval($scope.detect, 1000, 0, true)
    
    $scope.addNoisyTime = function(position, newNoise) {
        console.log('appending new noise at ' + position)
        $scope.noisyTimes.splice(position, 0, newNoise)
        
        //remove last element if we are trackign too many things
        if ($scope.noisyTimes.length > 3)
        {
            $scope.noisyTimes.pop()
        }
    }
    
    $scope.copyValue = function(valueToCopy) {
        return JSON.parse( JSON.stringify(valueToCopy))
    }
}])