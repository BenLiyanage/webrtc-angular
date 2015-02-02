//register provider
angular.module('webrtcApp').provider('soundMeter', function() { 
    this.$get = function() { return { 
        writeToConsole: function() { console.log("hello") }
    }}
})

function verifyResponse(httpBackend)
{
    httpBackend.flush();
    httpBackend.verifyNoOutstandingExpectation()
    httpBackend.verifyNoOutstandingRequest();
}

var controller, scope, soundMeter,  httpBackend;
describe("Angular Tests", function() {
    
    beforeEach(function() {
        module('webrtcApp')
        //Inject our scope variables
        inject(function($controller, $rootScope, _soundMeter_, $httpBackend) {
            scope = $rootScope.$new();
            soundMeter =  _soundMeter_;
            httpBackend = $httpBackend
            controller =  $controller('noisyTimesController', { $scope: scope, soundMeter: _soundMeter_});
        })
    })
    
    // it("Tests sending text messages", function() {
        // scope.$apply(function() { scope.sendTextNotification(); } )
    // })
    
    it("Tests Rquirements", function() {
        /* We are replicating this sequence of events
        Sequence    Cumulative Volume Output    Send Text
        0           5                           Yes, met threshold and CVO requirements.
        1           1                           Yes, met threshold and CVO requirements.
        2           3                           Yes, met threshold and CVO requirements.
        3           0                           No, not one of the top 3 longest/loudest sounds.
        4           2                           Yes, replaces the time from sequence 1 to be in the top 3 loudest/longest sounds.
        5           6                           Yes, replaces the time from sequence 4 to be in the top 3 loudest/longest sounds.
        */
        
        soundMeter.instant = .2
        soundMeter.noisy = false
        soundMeter.threshold = .1
        soundMeter.thisNoise = {}
        
        scope.detect()
        expect(scope.soundMeter.noisy).toBe(true)
        
        soundMeter.instant = 0
        soundMeter.cumulativeVolumeOutput = 5
        scope.detect()
        expect(scope.soundMeter.noisy).toBe(false)
        expect(scope.noisyTimes[0].cumulativeVolumeOutput).toBe(5) //aka 1 second long noisy time
        expect(scope.noisyTimes.length).toBe(1)
        
        //Verify that we got our text
        console.log(scope);
        httpBackend.expectPOST('http://cors-anywhere.herokuapp.com/https://api.sendhub.com/v1/messages/?api_key=57e642c3992c52ad08f26f4dced584a17e27588d&username=6506562778').respond(200);
        httpBackend.flush();
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest();
        
        soundMeter.instant = .2
        scope.detect()
        expect(scope.soundMeter.noisy).toBe(true)
        
        soundMeter.instant = 0
        soundMeter.cumulativeVolumeOutput = 1
        scope.detect()
        expect(scope.soundMeter.noisy).toBe(false)
        expect(scope.noisyTimes[0].cumulativeVolumeOutput).toBe(5)
        expect(scope.noisyTimes[1].cumulativeVolumeOutput).toBe(1)
        expect(scope.noisyTimes.length).toBe(2)
        
        //verify that we requested a text
        httpBackend.expectPOST('http://cors-anywhere.herokuapp.com/https://api.sendhub.com/v1/messages/?api_key=57e642c3992c52ad08f26f4dced584a17e27588d&username=6506562778').respond(200);
        httpBackend.flush();
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest();
        
        soundMeter.instant = .2
        scope.detect()
        expect(scope.soundMeter.noisy).toBe(true)
        
        soundMeter.instant = 0
        soundMeter.cumulativeVolumeOutput = 3
        scope.detect()
        expect(scope.soundMeter.noisy).toBe(false)
        expect(scope.noisyTimes[0].cumulativeVolumeOutput).toBe(5)
        expect(scope.noisyTimes[1].cumulativeVolumeOutput).toBe(3)
        expect(scope.noisyTimes[2].cumulativeVolumeOutput).toBe(1)
        expect(scope.noisyTimes.length).toBe(3)
        
        //verify that we requested a text
        httpBackend.expectPOST('http://cors-anywhere.herokuapp.com/https://api.sendhub.com/v1/messages/?api_key=57e642c3992c52ad08f26f4dced584a17e27588d&username=6506562778').respond(200);
        httpBackend.flush();
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest();
        
        // Make sure no 0 second times are added
        soundMeter.instant = .2
        scope.detect()
        expect(scope.soundMeter.noisy).toBe(true)
        
        soundMeter.instant = 0
        soundMeter.cumulativeVolumeOutput = 0
        scope.detect()
        expect(scope.soundMeter.noisy).toBe(false)
        expect(scope.noisyTimes[0].cumulativeVolumeOutput).toBe(5)
        expect(scope.noisyTimes[1].cumulativeVolumeOutput).toBe(3)
        expect(scope.noisyTimes[2].cumulativeVolumeOutput).toBe(1)
        expect(scope.noisyTimes.length).toBe(3)
        
        //verify that we did NOT requested a text
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest();
        
        //Push a 1 off of the listStyleType
        soundMeter.instant = .2
        scope.detect()
        expect(scope.soundMeter.noisy).toBe(true)
        
        soundMeter.instant = 0
        soundMeter.cumulativeVolumeOutput = 2
        scope.detect()
        expect(scope.soundMeter.noisy).toBe(false)
        expect(scope.noisyTimes[0].cumulativeVolumeOutput).toBe(5)
        expect(scope.noisyTimes[1].cumulativeVolumeOutput).toBe(3)
        expect(scope.noisyTimes[2].cumulativeVolumeOutput).toBe(2)
        expect(scope.noisyTimes.length).toBe(3)
        
        //verify that we requested a text
        httpBackend.expectPOST('http://cors-anywhere.herokuapp.com/https://api.sendhub.com/v1/messages/?api_key=57e642c3992c52ad08f26f4dced584a17e27588d&username=6506562778').respond(200);
        httpBackend.flush();
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest();
        
        //Push the 5 down
        soundMeter.instant = .2
        scope.detect()
        expect(scope.soundMeter.noisy).toBe(true)
        
        soundMeter.instant = 0
        soundMeter.cumulativeVolumeOutput = 6
        scope.detect()
        
        console.log(scope.noisyTimes)
        expect(scope.soundMeter.noisy).toBe(false)
        expect(scope.noisyTimes[0].cumulativeVolumeOutput).toBe(6)
        expect(scope.noisyTimes[1].cumulativeVolumeOutput).toBe(5)
        expect(scope.noisyTimes[2].cumulativeVolumeOutput).toBe(3)
        expect(scope.noisyTimes.length).toBe(3)
        
        //verify that we requested a text
        httpBackend.expectPOST('http://cors-anywhere.herokuapp.com/https://api.sendhub.com/v1/messages/?api_key=57e642c3992c52ad08f26f4dced584a17e27588d&username=6506562778').respond(200);
        httpBackend.flush();
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest();
    })
})