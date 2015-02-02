google.load("visualization", "1", {packages:["corechart"]});

webrtcApp.directive('graph', function($http, $interval, soundMeter) {
    return function (scope, iElement, iAttrs)
        {
            var chart = new google.visualization.AreaChart(iElement[0]);
            var chartOptions = {
                        title: iAttrs.title,
                        chartArea: {left:30, width:'100%' },
                        hAxis: { 
                            textPosition: 'none' 
                        },
                        vAxis: { 
                          viewWindowMode:'explicit',
                          viewWindow:{
                            max:1,
                            min:0
                          }
                        },
                        legend: {
                            position: 'bottom'
                        }
                    };
                    
            $interval(function() {
                //Update the graph
                if (soundMeter.graph[iAttrs.graph] != undefined && soundMeter.graph[iAttrs.graph].getNumberOfRows())
                {   
                    chart.draw(scope.soundMeter.graph[iAttrs.graph], chartOptions);
                }
            }, 2000)
        }
})