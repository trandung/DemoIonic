angular.module('app.services', [])

.service('Survey', ['$http', function($http){
    
    var api_url = 'YOUR_SHEETSU_URL';
    var currentID = 1;
    
    function filterBlankRows(l){
        return l.filter(function(obj){
            return obj.id != '';
        });
    }
    
    var ret = {
        all: function(){
            
            return $http.get(api_url).then(function(resp){
                var results = filterBlankRows(resp.data);
                if (results.length > 0) currentID = parseInt(results[results.length-1].id);
                return results;
            });
            
        }, 
        add: function(data){
            currentID++;
            data.id = currentID;
            
            return $http.post(api_url, data).then(function(resp){
                return resp.data;
            });

        },
        delete: function(id){
            return $http.delete(api_url+'/id/'+id);
        },
        query: function(params){
            
            var actual_params = [];
            for (var k in params){
                if (params[k]){
                    actual_params.push(k + '=' + params[k]);
                }
            }
            actual_params = '?'+actual_params.join('&');
            
            return $http.get(api_url+'/search'+actual_params).then(function(resp){
                return filterBlankRows(resp.data);
            })
            
        }
    }
    
    ret.all();
    
    return ret;

}]);



/*Demo web */
/*Trang js*/
// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, Survey, $ionicPopup) {

    $scope.data = {
        name: '',
        favorite_color: 'Orange',
        favorite_pizza: 'Pepperoni'
    }

    $scope.submitting = false;
    
    $scope.submit = function(){
        $scope.submitting = true;
        Survey.add($scope.data).then(function(){
            $scope.data = {
                name: '',
                favorite_color: 'Orange',
                favorite_pizza: 'Pepperoni'
            }
            $scope.submitting = false;
            
            $ionicPopup.alert({
                title: 'Thank you!',
                template: 'Your response has been recorded.'
            });
            
        })
    }

}

/*END*/

// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, Survey) {
    
    $scope.params = $stateParams;
    
    $scope.surveys = [];
    
    $scope.loadData = function(){
        
        if ($scope.params.name || $scope.params.favorite_color || $scope.params.favorite_pizza){
            Survey.query($scope.params).then(function(res){
                $scope.surveys = res;
                $scope.$broadcast('scroll.refreshComplete');
            })
        }else{
            Survey.all().then(function(res){
                $scope.surveys = res;
                $scope.$broadcast('scroll.refreshComplete');
            })
        }
        
    }

    $scope.loadData();
    
    $scope.showDelete = false;
    $scope.toggleDelete = function(){
        $scope.showDelete = !$scope.showDelete;
    }
    
    $scope.deleteItem = function($index){
        Survey.delete($scope.surveys[$index].id).then(function(){
            $scope.surveys.splice($index-1, 1);
        })
    }

}