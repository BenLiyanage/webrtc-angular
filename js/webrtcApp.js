var webrtcApp = angular.module('webrtcApp', [])
    
webrtcApp.controller('noisyTimesController', ['$scope', '$http', '$interval','soundMeter', function($scope, $http, $interval, soundMeter) {
    var initializer;
    $scope.noisy = false;
    $scope.noisyStart = 0
    $scope.noisyTimes = [];
    $scope.threshold = ".1";
    $scope.numberToText = "+14103362464"
    $scope.thisNoise = {}
    $scope.soundMeter = soundMeter
    
    $scope.detect = function()
    {
        try
        {
            console.log(soundMeter)
            //Detect if it's noisy
            if (soundMeter.slow > $scope.threshold && soundMeter.noisy === false)
            {
                console.log("its noisy!");
                soundMeter.noisy = true;
                noisyStart = audioContext.currentTime;
                $scope.thisNoise.start = new Date().toLocaleString();
            }
            else if (soundMeter.slow < $scope.threshold && soundMeter.noisy === true)
            {
                console.log('it\'s quiet now');
                soundMeter.noisy = false;
                $scope.thisNoise.cumulativeVolumeOutput = $scope.copyValue(soundMeter.cumulativeVolumeOutput);
                soundMeter.cumulativeVolumeOutput = 0
                $scope.thisNoise.end = new Date().toLocaleString();
                
                //copy the scope by value not reference
                var newNoise = $scope.copyValue($scope.thisNoise);
                console.log(newNoise)
                
                if ($scope.noisyTimes.length === 0)
                {
                    $scope.addNoisyTime(0, newNoise)
                }
                else
                {
                    var addedElement = false;
                    for (var i = $scope.noisyTimes.length; i--; i > 0)
                    {
                        if ($scope.noisyTimes[i].cumulativeVolumeOutput < $scope.thisNoise.cumulativeVolumeOutput)
                        {
                            addedElement = true;
                            $scope.addNoisyTime(i-1, newNoise)  //-1 to add before the current item
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
        
        //notify phone number that its been noisy
        $scope.sendTextNotification()
    }
    
    $scope.sendTextNotification = function() {
        
            $http({
                method: 'post', 
                url: 'http://cors-anywhere.herokuapp.com/https://api.sendhub.com/v1/messages/',
                params: { 'username': '6506562778', 'api_key': '57e642c3992c52ad08f26f4dced584a17e27588d' }, //its bad practice to put api keys into a javascript file
                data: { 'contacts': [  $scope.numberToText ], 'text':'It\'s so loud in here' }
            })
            .error(function (data, status, headers, config) {  console.log(data, status, headers, config) })
            .success(function (data, status, headers, config) { console.log(data, status, headers, config) })
    }
    
    $scope.copyValue = function(valueToCopy) {
        return JSON.parse( JSON.stringify(valueToCopy))
    }
}])