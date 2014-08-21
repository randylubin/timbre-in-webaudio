intrumentSounds = angular.module('intrumentSounds', ['ngRoute']).
	config(function($routeProvider) {
		$routeProvider.
			when('/', {controller:'HomePageCtrl', templateUrl:'views/homePage.html'}).
			when('/theremin', {controller:'soundCtrl', templateUrl:'views/theremin.html'}).
			otherwise({redirectTo:'/'});
	});

var context = new (window.AudioContext || window.webkitAudioContext)();
var masterGainDefault = 0.04;


intrumentSounds.controller('soundCtrl', ['$scope',
	function soundCtrl($scope){
		$scope.data = {
			fundamentalFrequency: 440,
			overtones: 7,
			decreaseVolumeRate: 0.8
		}

		$scope.masterGain = context.createGain();
		$scope.masterGain.gain.value = masterGainDefault;
		$scope.masterGain.connect(context.destination)

		$scope.masterMerger = context.createChannelMerger()
		$scope.masterMerger.numberOfInputs = 1
		$scope.masterMerger.connect($scope.masterGain)

		$scope.buildOvertoneSeries = function(frequency, overtones){
			for (var i = 0; i < overtones; i++){
				var name = "Harmonic " + (i +1);
				osc = $scope.newOscGainCombo(frequency * (1+i), 1, name)
				osc.gain.gain.value = Math.pow($scope.data.decreaseVolumeRate, i).toFixed(2)
			}
		}

		$scope.rebuildOvertoneSeries = function(){
			_.each($scope.data.oscillators, function(osc){
				osc.osc.disconnect();
				osc.gain.disconnect();
				console.log(osc.gain)
			})
			$scope.data.oscillators = [];
			$scope.buildOvertoneSeries($scope.data.fundamentalFrequency, $scope.data.overtones)
		}

		function OscGainCombo (frequency, gain) {
			this.osc = context.createOscillator();

			this.gain = context.createGain();
			
			this.osc.connect(this.gain);
			this.gain.connect($scope.masterMerger)

			this.osc.start(0); 
			this.osc.type = 'sine';
			this.osc.frequency.value = frequency;
			this.gain.gain.value = 1;

		}

		$scope.changeWaveType = function(type){
			_.each($scope.data.oscillators, function(osc){
				osc.osc.type = type;
			})
		}

		$scope.data.oscillators = []

		$scope.togglePlay = function(){
			$scope.masterGain.gain.value = (($scope.masterGain.gain.value) ? 0 : masterGainDefault)
		}

		$scope.newOscGainCombo = function(frequency, gain, name){
			var oscillator = new OscGainCombo(frequency, gain);
			oscillator.name = name
			$scope.data.oscillators.push(oscillator);
			return oscillator
		}

		$scope.randomizeVolume = function(){
			_.each($scope.data.oscillators, function(osc){
				osc.gain.gain.value = Math.random().toFixed(1);
			})
		}
		$scope.evenVolume = function(){
			_.each($scope.data.oscillators, function(osc){
				osc.gain.gain.value = 0.7;
			})
		}

		$scope.buildOvertoneSeries($scope.data.fundamentalFrequency, $scope.data.overtones);
		console.log($scope.data.oscillators)

}
]);

intrumentSounds.controller('HomePageCtrl', ['$scope',
	function SyncCtrl($scope){
	}
]);

function navBar($scope){
	$scope.goto = function(location){
		window.location = '/#/' + location;
	}
}