'use strict';

var serverURL = "http://istavrit.eng.ku.edu.tr/~Group_6/query.php";

angular.module('main', ['ngStorage','ngRoute','ngAnimate','ngTouch','ui.bootstrap','angular-loading-bar'])
.config(['$routeProvider','cfpLoadingBarProvider','$httpProvider',function ($routeProvider,cfpLoadingBarProvider,$httpProvider) {

  $httpProvider.defaults.headers.common = {};
  $httpProvider.defaults.headers.post = {};
  $httpProvider.defaults.headers.put = {};
  $httpProvider.defaults.headers.patch = {};

  // cfpLoadingBarProvider.includeSpinner = true;
  // cfpLoadingBarProvider.includeBar = true;

  $routeProvider.
  when('/', {
    templateUrl: 'home.html',
    controller: 'homeCtrl'
  }).
  // when('/wellcome', {
  //     templateUrl: 'wellcome.html',
  //     controller: 'wellcomeScreenCtrl'
  // }).
  when('/rest/:owner/:name', { //TODO
    templateUrl: 'restaurant.html',
    controller: 'restaurantCtrl'
  }).
  when('/restedit/:owner/:name', { //TODO
    templateUrl: 'restaurantEdit.html',
    controller: 'restaurantEditCtrl'
  }).
  when('/register/', {
    templateUrl: 'register.html',
    controller: 'registerCtrl'
  }).
  when('/openrestaurant/', {
    templateUrl: 'openrestaurant.html',
    controller: 'openrestaurantCtrl'
  }).
  when('/orders/', {
    templateUrl: 'orders.html',
    controller: 'ordersCtrl'
  }).
  when('/order/:id', {
    templateUrl: 'orderPage.html',
    controller: 'orderPageCtrl'
  }).
  when('/editaccount/', {
    templateUrl: 'editaccount.html',
    controller: 'editaccountCtrl'
  }).
  otherwise({
    redirectTo: '/'
  });
}])
.controller('mainCtrl', ['$rootScope','$scope','$localStorage','$location','$http','$timeout', function($rootScope,$scope,$localStorage,$location,$http,$timeout){
  $scope.loading = true;

  $scope.goHome = function(){
    $location.path('/');
  }
  $rootScope.appTitle = "Wellcome";
  $scope.$storage = $localStorage;

  $rootScope.addOrderHour = 0;
  $rootScope.addOrderMin = 0;

  $scope.watchAddOrderTime = function(){

    if($rootScope.addOrderHour < 0){
      $rootScope.addOrderHour = 0;
    }
    if($rootScope.addOrderMin < 0){
      $rootScope.addOrderMin = 0;
    }

    if(($rootScope.addOrderHour*60 + $rootScope.addOrderMin) > 2880){
      $rootScope.addOrderMin = 0;
      $rootScope.addOrderHour = 48;
    } else if($rootScope.addOrderMin > 60 ){
      $rootScope.addOrderMin = 60;
    }

  }

  $timeout(function(){

    if($localStorage.user){


      //To be changed later
      $scope.updateMIQuantity = function(){};

      var upmiq = function(item,quantity){
        $scope.sepetloading = true;
        $http.get(serverURL + "?type=4&job=2&token="+$localStorage.user.token+"&item="+item+"&quantity="+quantity)
        .then(function successCallback(response) {
          $scope.sepetloading = false;
          console.log(response);
        }, function errorCallback(response) {
          console.log("updateMIQuantity error",response);
          $scope.sepetloading = false;
        });
      }
      $scope.updatePromoQuantity = function(){};

      var uppq = function(promotion,quantity){
        $scope.sepetloading = true;
        $http.get(serverURL + "?type=4&job=3&token="+$localStorage.user.token+"&promotion="+promotion+"&quantity="+quantity)
        .then(function successCallback(response) {
          $scope.sepetloading = false;
          console.log(response);
        }, function errorCallback(response) {
          console.log("updatePromoQuantity error",response);
          $scope.sepetloading = false;
        });
      }

      $scope.sepet = {"menu_items":[],"promotions":{},"promotion_quantities":{},"promotion_costs":{}};

      $rootScope.loadSepet = function(){

        //To be changed later
        $scope.updateMIQuantity = function(){};
        $scope.updatePromoQuantity = function(){};

        $scope.sepetloading = true;

        $http.get(serverURL+"?type=1&job=4&token="+$localStorage.user.token)
        .then(function successCallback(response) {
          console.log("sepet response",response);

          $scope.sepet = {"menu_items":[],"promotions":{},"promotion_quantities":{},"promotion_costs":{}};

          $scope.sepetloading = false;

          if(response && response["data"] && "menu_items" in response["data"]) {

            for(var key in response["data"]["menu_items"]){

              var item = response["data"]["menu_items"][key];

              item.quantity = parseInt(item.quantity);
              item.price = parseFloat(item.price);

              $scope.sepet["menu_items"].push(item);
            }

          }

          if(response && response["data"] && "promotions" in response["data"]){
            for(var key in response["data"]["promotions"]){

              var item = response["data"]["promotions"][key];

              if(!$scope.sepet["promotions"][item["promotion"]]){
                $scope.sepet["promotion_quantities"][item["promotion"]] = parseInt(item.quantity);
                $scope.sepet["promotion_costs"][item["promotion"]] = parseFloat(item.cost);

                $scope.sepet["promotions"][item["promotion"]] = [];
              }

              $scope.sepet["promotions"][item["promotion"]].push(item);

            }
          }

          $scope.updateMIQuantity = upmiq;

          $scope.updatePromoQuantity = uppq;

          console.log($scope.sepet);

        }, function errorCallback(response) {
          console.log("sepet response fail",response);

          if(response && response["status"] < 0){
            alert("Please check internet connection and try again.");
          }

        });

      }


      $scope.deleteSepet = function(){

        $scope.sepetloading = true;

        $http.get(serverURL+"?type=4&job=4&token="+$localStorage.user.token)
        .then(function successCallback(response) {

          console.log("delete sepet",response);

          $rootScope.loadSepet();

        }, function errorCallback(response) {

          console.log("delete sepet fail",response);

          if(response && response["status"] < 0){
            alert("Please check internet connection and try again.");
          }

        });

      }


      $scope.placeOrder = function(){
        $scope.sepetloading = true;

        var d = new Date();

        if($scope.futureOrder){
          d.setMinutes(d.getMinutes() + $rootScope.addOrderHour*60 + $rootScope.addOrderMin);
          console.log(d);
        }

        $http.get(serverURL+"?type=4&job=5&token="+$localStorage.user.token + "&date="+ Math.ceil((d.getTime())/1000) )
        .then(function successCallback(response) {

          console.log("placeOrder",response);

          $rootScope.loadSepet();

        }, function errorCallback(response) {

          console.log("placeOrder fail",response);

          if(response && response["status"] < 0){
            alert("Please check internet connection and try again.");
          }

        });
      }



      $rootScope.loadRests = function(){

        $scope.restsloading = true;

        $http.get(serverURL+"?type=1&job=9&token="+$localStorage.user.token)
        .then(function successCallback(response) {

          console.log("loadRests",response);

          if("data" in response && response["data"] && response["data"].length >= 0){

            response["data"].unshift("Open New");
            //$scope.restaurants = response["data"];

            $scope.restaurants = [];

            for(var key in response["data"]){
              $scope.restaurants.push({"name":response["data"][key]});
            }

          }

          $scope.restsloading = false;

        }, function errorCallback(response) {

          console.log("loadRests fail",response);

          if(response && response["status"] < 0){
            alert("Please check internet connection and try again.");
          }

        });


      }

      $scope.openRest = function(rest){

        if(!rest || rest == null){
          return;
        }

        if(rest.name == "Open New"){
          $location.path('/openrestaurant/');
        } else {
          $location.path('/rest/'+$localStorage.user.username+"/"+rest.name);
        }

      }

      $http.get(serverURL + "?type=2&job=3&token="+$localStorage.user.token)
      .then(function successCallback(response) {
        $scope.loading = false;
        if("data" in response){
          $localStorage.user = response["data"];
        }

        if($localStorage.user.type == 2){
          $rootScope.loadSepet();
        } else if($localStorage.user.type == 1){
          $rootScope.loadRests();
        }

        $scope.$watchCollection('$storage.user',function(newVal,oldVal){
          if(newVal && newVal.token){
            if(newVal.type == 2){
              $rootScope.loadSepet();
            } else if(newVal.type == 1){
              $rootScope.loadRests();
            }
          }
        });

      }, function errorCallback(response) {
        $scope.loading = false;
        delete $localStorage.user;
        $location.path('/');
      });

    } else {
      $scope.loading = false;
    }

  });

}])
.controller('loginCtrl', ['$scope','$rootScope','$localStorage','$http','$timeout','$location', function($scope,$rootScope,$localStorage,$http,$timeout,$location){

  $scope.register = function(){
    $location.path('/register/');
  }

  $scope.login = function(name,pass){

    $scope.loadingLogin = true;

    $http.post(serverURL + "?type=2&job=0",{"username":name,"password":pass})
    .then(function successCallback(response) {
      console.log("Login ",response);

      if(response["data"] && response["data"]["token"]){
        $localStorage.user = response["data"];
        delete $scope.ErrorMessage;
        console.log("user", response["data"]);
      } else {
        console.log("no token.");
        if(response["data"] && "message" in response["data"]) $scope.ErrorMessage = response["data"]["message"];
      }


      if($localStorage.user.type == 2){
        $rootScope.loadSepet();
      } else if($localStorage.user.type == 1){
        $rootScope.loadRests();
      }

    }, function errorCallback(response) {
      $scope.loadingLogin = false;
      console.log("Login Fail ",response);
      if(response && response["status"] < 0){
        alert("Please check internet connection and try again.");
      } else if(response["data"] && "message" in response["data"]){
        $scope.ErrorMessage = response["data"]["message"];
      }
    });
  }

  $scope.logout = function(){
    $scope.loadingLogin = true;
    delete $localStorage.user;
    delete $scope.ErrorMessage;
    $scope.loadingLogin = false;
  }

}])
.controller('searchCtrl',[ '$scope',
'$localStorage','$http', '$timeout', 'rulesService','$location', function($scope,$localStorage,$http,$timeout,rulesService,$location){

  $scope.convertmitype = rulesService.mitypeToStr;

  $scope.openRest = function(owner,name){
    $location.path("/rest/"+owner+"/"+name);
    $scope.keywords = '';
    $scope.search('');
  }

  $scope.log = function(a){
    console.log(a);
  }

  var request; //For canceling.

  var last;

  $scope.search = function(keywords){

    $timeout.cancel(last);

    if(request && typeof request.cancel == "function") request.cancel("TODO:reason.");

    if(keywords == ''){
      $scope.results = {};
      return;
    }

    last = $timeout(function(){

      //TODO get request for search.

      request = $http.get(serverURL+"?type=1&job=1&keywords="+encodeURIComponent(keywords)+"&token="+$localStorage.user.token)
      .then(function successCallback(response) {
        console.log("search response",response);

        if(response && response["data"]) {
          $scope.results = response["data"];
        }

      }, function errorCallback(response) {
        console.log("search response fail",response);

        if(response && response["status"] < 0){
          alert("Please check internet connection and try again.");
        }

      });

    },500);
  }

  $scope.$watchCollection('$storage.user',function(newVal,oldVal){
      $scope.keywords = '';
      $scope.search('');
  });

}])
.controller('orderCtrl',[ '$scope', '$rootScope',
'$localStorage','$http', '$interval','$location', function($scope,$rootScope,$localStorage,$http,$interval,$location){

  $rootScope.updateOrders = function(){
    $http.get(serverURL+"?type=1&job=10&status=0&token="+$localStorage.user.token)
    .then(function successCallback(response) {
      console.log("pendding orders",response);

      if(response && response["data"]) {
        $scope.orders = response["data"];
      }

    }, function errorCallback(response) {
      console.log("pendding orders fail",response);

      if(response && response["status"] < 0){
        alert("Please check internet connection and try again.");
      }

    });
  };

  $scope.finishOrder = function(order){
    order.ErrorMessage = '';
    $http.get(serverURL + "?type=1&job=11&token="+$localStorage.user.token+"&ID="+order.ID)
    .then(function successCallback(response) {

      if(response["data"] && "message" in response["data"]){
        order.ErrorMessage = response["data"]["message"];
      } else {
        order.status = 1;
        $rootScope.updateOrders();
      }

    }, function errorCallback(response) {
      console.log("finish order Fail ",response);
      if(response && response["status"] < 0){
        alert("Please check internet connection and try again.");
      } else if(response["data"] && "message" in response["data"]){
        order.ErrorMessage = response["data"]["message"];
      }
    });
  }

  $scope.openOrder= function(orderID){
    $location.path('/order/'+orderID);
  }

  $rootScope.updateOrders();

  var intervalPromise = $interval(function () {
    $rootScope.updateOrders();
  }, 40000);
  $scope.$on('$destroy', function () { $interval.cancel(intervalPromise); });

}])
.controller('homeCtrl',[ '$scope',
'$localStorage', function($scope,$localStorage){

  //TODO

}])
.controller('registerCtrl',[ '$scope',
'$localStorage', '$http', '$timeout','$location', function($scope,$localStorage,$http,$timeout,$location){

  if($localStorage.user && "token" in $localStorage.user){
    $location.path('/');
  }

  $scope.loading = true;

  $scope.types = [
    {
      value:2,
      text:"Customer"
    },
    {
      value:1,
      text:"Owner"
    }
  ];
  $scope.type = $scope.types[0];

  $http.get(serverURL + "?type=1&job=2")
  .then(function successCallback(response) {
    console.log("district",response);

    if("data" in response){
      $scope.districts = response["data"];
      $scope.district = $scope.districts[0];
    }

    $scope.loading = false;

  }, function errorCallback(response) {
    console.log("district Fail ",response);
    if(response && response["status"] < 0) {
      alert("Please check internet connection and try again.");
    }
  });

  $scope.areValuesValid = function(){

    if($scope.password && $scope.password.length < 6){
      $scope.passMessage = 'Password should be longer then 6 characters.';
      return false;
    } else if($scope.password && !$scope.password.match(/[a-z]/i)){
      $scope.passMessage = 'Password should start with a letter.';
      return false;
    } else if($scope.password && !$scope.password.match(/^[a-z0-9]+$/i)) {
      $scope.passMessage = 'Password should consist of only alphanumeric characters.';
      return false;
    } else if($scope.username && !$scope.username.length > 3){
      $scope.usernameMessage = 'Username should be longer then 3 characters.';
      return false;
    } else if ($scope.username && !$scope.username.match(/^[a-z0-9]+$/i)){
      $scope.usernameMessage = 'Username should consist of only alphanumeric characters.';
      return false;
    }

    $scope.passMessage = '';
    $scope.usernameMessage = '';

    return $scope.password
    && $scope.username
    && $scope.door
    && $scope.street
    && $scope.city
    && $scope.name
    && $scope.surname
    && $scope.phone;

  }

  $scope.submit = function(){
    $scope.submitting = true;

    $scope.ErrorMessage = '';

    $http.post(serverURL + "?type=2&job=1",{
      "username": $scope.username,
      "password": $scope.password,
      "door": $scope.door,
      "street": $scope.street,
      "city": $scope.city,
      "add_d": $scope.district,
      "name": $scope.name,
      "surname": $scope.surname,
      "phone": $scope.phone,
      "usertype": $scope.type.value,
    })
    .then(function successCallback(response) {
      console.log("Register ",response);
      if(response["data"] && response["data"]["token"]){
        $localStorage.user = response["data"];
        $location.path('/');
      } else {
        console.log("no token.");
        if(response["data"] && typeof response["data"] == "object"  && "message" in response["data"]) $scope.ErrorMessage = response["data"]["message"];
      }
    }, function errorCallback(response) {
      $scope.submitting = false;
      console.log("Register Fail ",response);
      if(response && response["status"] < 0){
        alert("Please check internet connection and try again.");
      } else if(response["data"] && "message" in response["data"]){
        $scope.ErrorMessage = response["data"]["message"];
      }
    });
  }

}])
.controller('openrestaurantCtrl',[ '$rootScope','$scope',
'$localStorage', '$http', '$timeout','$location', function($rootScope,$scope,$localStorage,$http,$timeout,$location){

  if(!$localStorage.user || !("token" in $localStorage.user) || $localStorage.user.type != 1){
    $location.path('/');
    return;
  }

  $scope.loading = true;

  $scope.payments = [
    {
      value:0,
      text:"Card"
    },
    {
      value:1,
      text:"Online Card"
    },
    {
      value:2,
      text:"Cash"
    }
  ];
  $scope.payment = $scope.payments[0];

  $http.get(serverURL + "?type=1&job=2")
  .then(function successCallback(response) {
    console.log("district",response);

    if("data" in response){
      $scope.districts = response["data"];
      $scope.district = $scope.districts[0];
    }

    $scope.loading = false;

  }, function errorCallback(response) {
    console.log("district Fail ",response);
    if(response && response["status"] < 0) {
      alert("Please check internet connection and try again.");
    }
  });

  /*
  door
  street
  city
  add_d
  name
  work_hour_start
  work_hour_end
  payment
  */

  var formatToTime = function(value){
    if(value && "getHours" in value && "getMinutes" in value ){
      return value.getHours() + ":" +  value.getMinutes() + ":00";
    }
    return null;
  }


  $scope.areValuesValid = function(){

    if($scope.name && $scope.name.length > 0 && ($scope.name.length < 3 || !$scope.name.match(/^[a-z0-9]+$/i) )){
      $scope.namemessage = "Invalid name";
      return false;
    }

    $scope.namemessage = '';

    if($scope.work_hour_start && $scope.work_hour_end){

      var startnum = $scope.work_hour_start.getHours() * 60 + $scope.work_hour_start.getMinutes();
      var endnum = $scope.work_hour_end.getHours() * 60 + $scope.work_hour_end.getMinutes();

      if($scope.work_hour_end.getHours() <= 12){
        endnum += 24*60;
      }

      if(startnum >= endnum){
        $scope.workinghourmessage = 'Starting hour should be before then ending hour.';
        return false;
      }

      if(startnum + 120 >= endnum){
        $scope.workinghourmessage = 'Restaurant should be open for at least 2 hours.';
        return false;
      }

    }

    $scope.workinghourmessage = '';

    return $scope.door
    && $scope.street
    && $scope.city
    && $scope.name
    && $scope.work_hour_start
    && $scope.work_hour_end;

  }

  $scope.submit = function(){
    $scope.submitting = true;

    $scope.ErrorMessage = '';

    $http.post(serverURL + "?type=3&job=0&token="+$localStorage.user.token,{
      "door": $scope.door,
      "street": $scope.street,
      "city": $scope.city,
      "add_d": $scope.district,
      "name": $scope.name,
      "payment": $scope.payment.value,
      "work_hour_start": formatToTime($scope.work_hour_start),
      "work_hour_end": formatToTime($scope.work_hour_end),
    })
    .then(function successCallback(response) {
      console.log("open rest ",response);

      $location.path('/');
      $rootScope.loadRests();

    }, function errorCallback(response) {
      $scope.submitting = false;
      console.log("open rest Fail ",response);
      if(response && response["status"] < 0){
        alert("Please check internet connection and try again.");
      } else if(response["data"] && "message" in response["data"]){
        $scope.ErrorMessage = response["data"]["message"];
      }
    });
  }


}])
.controller('editaccountCtrl',[ '$scope',
'$localStorage', '$http', '$timeout','$location', function($scope,$localStorage,$http,$timeout,$location){

  if(!$localStorage.user || ! ("token" in $localStorage.user)){
    $location.path('/');
  }

  $scope.loading = -2;

  $scope.types = [
    {
      value:2,
      text:"Customer"
    },
    {
      value:1,
      text:"Owner"
    }
  ];
  $scope.type = $scope.types[0];

  $http.get(serverURL + "?type=1&job=2")
  .then(function successCallback(response) {
    console.log("district",response);

    if("data" in response){
      $scope.districts = response["data"];
      $scope.district = $scope.districts[0];
    }

    $scope.loading++;

  }, function errorCallback(response) {
    console.log("district Fail ",response);
    if(response && response["status"] < 0) {
      alert("Please check internet connection and try again.");
    }
  });

  $http.get(serverURL + "?type=1&job=3&token="+$localStorage.user.token)
  .then(function successCallback(response) {
    console.log("user info",response);

    if("data" in response){
      $scope.district = response["data"].add_d;
      $scope.city = response["data"].city;
      $scope.door = response["data"].door;
      $scope.name = response["data"].name;
      $scope.phone = parseInt(response["data"].phone);
      $scope.street = response["data"].street;
      $scope.surname = response["data"].surname;
      $scope.user_add = response["data"].user_add;
    }

    $scope.loading++;

  }, function errorCallback(response) {
    console.log("user info Fail ",response);
    if(response && response["status"] < 0) {
      alert("Please check internet connection and try again.");
    }
  });

  $scope.areValuesValid = function(section){
    if(section == 0){
      return $scope.name
      && $scope.surname
      && $scope.phone;
    } else {
      return $scope.door
      && $scope.street
      && $scope.city;
    }
  }

  $scope.submit = function(section){

    $scope.submitting = true;

    if(section == 0){

      $http.post(serverURL + "?type=4&job=0&token="+$localStorage.user.token,{
        "name": $scope.name,
        "surname": $scope.surname,
        "phone": $scope.phone,
      })
      .then(function successCallback(response) {
        console.log("Edit account ",response);

        $http.get(serverURL + "?type=2&job=3&token="+$localStorage.user.token)
        .then(function successCallback(response) {
          $scope.submitting = false;
          if("data" in response){
            $localStorage.user = response["data"];
          }
        }, function errorCallback(response) {
          $scope.submitting = false;
          console.log("user edit's user get error",response);
        });

      }, function errorCallback(response) {
        $scope.submitting = false;
        console.log("Edit account ",response);
        if(response && response["status"] < 0){
          alert("Please check internet connection and try again.");
        } else if(response["data"] && "message" in response["data"]){
          $scope.ErrorMessage = response["data"]["message"];
        }
      });

    } else {

      $http.post(serverURL + "?type=4&job=1&token="+$localStorage.user.token,{
        "ID": $scope.user_add,
        "door": $scope.door,
        "street": $scope.street,
        "city": $scope.city,
        "add_d": $scope.district,
      })
      .then(function successCallback(response) {
        console.log("Edit account ",response);
        $scope.submitting = false;

      }, function errorCallback(response) {
        $scope.submitting = false;
        console.log("Edit account ",response);
        if(response && response["status"] < 0){
          alert("Please check internet connection and try again.");
        } else if(response["data"] && "message" in response["data"]){
          $scope.ErrorMessage = response["data"]["message"];
        }
      });

    }




  }

}])
.controller('ordersCtrl',[ '$rootScope','$scope',
'$localStorage', '$http', '$timeout', '$location', function($rootScope,$scope,$localStorage,$http,$timeout, $location){

  $timeout(function () {

    if(!$localStorage.user || ! ("token" in $localStorage.user)){
      $location.path('/');
      return;
    }

    $scope.loading = true;

    var canReview = function(order){
      return order["status"] == 1 && order["has_rev"] == 0 && Math.floor(Math.abs(order.date.getTime() - (new Date()).getTime()) / (1000 * 3600 * 24)) < 14;
    }

    $http.get(serverURL + "?type=1&job=7&token="+$localStorage.user.token)
    .then(function successCallback(response) {
      console.log("orders",response);
      $scope.loading = false;
      if("data" in response){

        for(var key in response["data"]){
          var item = response["data"][key];

          item["datetext"] = new Date(item["date"]).toString();
          item["date"] = new Date(item["date"])
          item["ID"] = parseInt(item["ID"]);
          item["status"] = parseInt(item["status"]);
          item["has_rev"] = parseInt(item["has_rev"]);

          item["can_review"] = canReview(item);

        }

        $scope.orders = response["data"];

      }
    }, function errorCallback(response) {
      $scope.loading = false;
      console.log("orders fail",response);
    });

    $scope.openOrder = function(orderID) {
      $location.path("/order/"+orderID);
    }


    $scope.review = function(order) {
      order.can_review = false;
      order.review_mode = true;
      order.rank = 10;
    }

    $scope.submitReview = function(order) {
      /*
      rank
      comment
      rest_ow
      rest_name
      order
      */

      order.submitting = true;

      order.rank = 0.0 + order.rank/2;

      console.log(order);

      $http.post(serverURL + "?type=4&job=7&token="+$localStorage.user.token,{
        "rank":order.rank,
        "comment":order.comment,
        "rest_ow":order.rest_ow,
        "rest_name":order.rest_name,
        "order":order.ID
      }).then(function successCallback(response) {
        console.log("review",response);
        order.submitting = false;
        order.review_mode = false;
      }, function errorCallback(response) {
        order.submitting = false;
        console.log("review fail",response);
      });

    }

    $scope.$watchCollection('$storage.user',function(newVal,oldVal){
      if(!newVal || ! newVal.token){
        $scope.orders = [];
        $location.path('/');
      }
    });

  });

}])
.controller('orderPageCtrl',[ '$rootScope','$scope',
'$localStorage','$routeParams', '$http', '$timeout', '$location', function($rootScope,$scope,$localStorage,$routeParams,$http,$timeout, $location){

  $scope.orderID = $routeParams.id;

  $timeout(function () {

    $scope.loading = true;

    $scope.menu_items = [];
    $scope.promotions = {};
    $scope.promotion_costs = [];

    $http.get(serverURL + "?type=1&job=8&token="+$localStorage.user.token+"&order="+$scope.orderID)
    .then(function successCallback(response) {
      console.log("orderPageCtrl",response);
      $scope.loading = false;
      if("data" in response){

        var item = response["data"];

        $scope.date = new Date(item["date"]).toString();
        $scope.status = item["status"];
        $scope.rest_name = item["rest_name"];
        $scope.rest_ow = item["rest_ow"];
        $scope.user = item["user"];

        if("menu_items" in response["data"]) $scope.menu_items = response["data"]["menu_items"];


        if("promotions" in response["data"]){
          var temp = response["data"]["promotions"];

          for(var key in temp){

            var item = temp[key];

            if(!$scope.promotions[item["promotion"]]){
              $scope.promotion_costs[item["promotion"]] = parseFloat(item.cost);
              $scope.promotions[item["promotion"]] = [];
            }

            $scope.promotions[item["promotion"]].push(item);

          }

        }


      }
    }, function errorCallback(response) {
      $scope.loading = false;
      console.log("orderPageCtrl fail",response);
      if(response && response["status"] < 0) {
        alert("Please check internet connection and try again.");
      }
    });

  });

}])
.controller('restaurantEditCtrl',[ '$rootScope','$scope',
'$localStorage','$routeParams', '$http', '$timeout', '$location', '$interval', function($rootScope,$scope,$localStorage,$routeParams,$http,$timeout, $location,$interval){

  $scope.name = $routeParams.name;

  $scope.owner = $routeParams.owner;

  $scope.loading = 0;

  if(!$localStorage.user || !$localStorage.user.token || $localStorage.user.username != $scope.owner){
    $location.path('/');
  }


  $scope.loading--;
  $http.get(serverURL + "?type=1&job=2")
  .then(function successCallback(response) {
    console.log("district",response);

    if("data" in response){
      $scope.districts = response["data"];
      $scope.district = $scope.districts[0];
    }

    $scope.loading++;

  }, function errorCallback(response) {
    console.log("district Fail ",response);
    $scope.loading++;
    if(response && response["status"] < 0) {
      alert("Please check internet connection and try again.");
    }
  });


  $scope.getRestDistricts = function(){

    $scope.submitting = true;

    $http.get(serverURL + "?type=3&job=6&name="+$scope.name+"&owner="+$scope.owner)
    .then(function successCallback(response) {
      console.log("getRestDistricts",response);

      $scope.submitting = false;

      $scope.regions = response["data"];

    }, function errorCallback(response) {
      console.log("getRestDistricts Fail ",response);
      $scope.submitting = false;
      if(response && response["status"] < 0) {
        alert("Please check internet connection and try again.");
      }
    });

  }

  $scope.getRestDistricts();

  $scope.isAvgValid = function(){

    if(!$scope.district_time){
      $scope.RegionErrorMessage = '';
      return false;
    }

    if($scope.district_time >= 30 && $scope.district_time <=120){
      $scope.RegionErrorMessage = '';
      return false;
    } else {
      $scope.RegionErrorMessage = 'Average time must be between 30 minutes and 120 minutes';
      return true;
    }
  }

  $scope.addRegion = function(district,district_time){
    $scope.submitting = true;

    $http.get(serverURL + "?type=3&job=7&token="+$localStorage.user.token+"&district="+district+"&name="+$scope.name+"&avg_minutes="+district_time)
    .then(function successCallback(response) {
      console.log("addRegion",response);

      $scope.getRestDistricts();

    }, function errorCallback(response) {
      console.log("addRegion Fail ",response);
      $scope.submitting = false;
      if(response && response["status"] < 0) {
        alert("Please check internet connection and try again.");
      }
    });

  }

  $scope.closeRest = function(district,district_time){
    $scope.closeRestSub = true;

    $http.get(serverURL + "?type=3&job=2&token="+$localStorage.user.token+"&name="+$scope.name)
    .then(function successCallback(response) {
      console.log("closeRest",response);

      $scope.closeRestSub = false;

      $location.path('/');
      $rootScope.loadRests();

    }, function errorCallback(response) {
      console.log("closeRest Fail ",response);
      $scope.closeRestSub = false;

      if(response && response["status"] < 0) {
        alert("Please check internet connection and try again.");
      } else if("data" in response && "message" in response["data"]){
        $scope.RestCloseError = response["data"]["message"];
      }

    });

  }


}])
.controller('restaurantCtrl',[ '$rootScope','$scope',
'$localStorage','$routeParams', '$http', '$timeout', '$location', '$interval', function($rootScope,$scope,$localStorage,$routeParams,$http,$timeout, $location,$interval){

  $scope.name = $routeParams.name;

  $scope.owner = $routeParams.owner;

  //TODO calculate top 3 most ordered food.

  $scope.loading = 0;

  if(!$localStorage.user || !$localStorage.user.token){
    $location.path('/');
  } else {

    $timeout(function(){

      $scope.menu_items = [];
      $scope.promotions = {};
      $scope.promotion_costs = [];

      $scope.loading--;
      $http.get(serverURL + "?type=1&job=5&token="+$localStorage.user.token+ "&owner=" + encodeURIComponent($scope.owner) + "&name="+encodeURIComponent($scope.name))
      .then(function successCallback(response) {
        console.log("rest ",response);

        if("data" in response){
          if("fav" in response["data"]) $scope.fav = response["data"]["fav"];

          if("menu" in response["data"]){

            if("menu_items" in response["data"]["menu"]) $scope.menu_items = response["data"]["menu"]["menu_items"];

            var clone = angular.fromJson(angular.toJson(response["data"]["menu"]["menu_items"]));

            clone.sort(function sortfunction(a, b){
              //Compare "a" and "b" in some fashion, and return -1, 0, or 1
              var a = parseInt(a.ordercount);
              var b = parseInt(b.ordercount);
              if(a ==  b){
                return 0;
              } else if (a > b){
                return -1;
              } else {
                return 1;
              }
            });

            $scope.topItems = clone.slice(0,3);

            if("promotions" in response["data"]["menu"]){
              var temp = response["data"]["menu"]["promotions"];

              for(var key in temp){

                var item = temp[key];

                if(!$scope.promotions[item["promotion"]]){
                  $scope.promotion_costs[item["promotion"]] = parseFloat(item.cost);
                  $scope.promotions[item["promotion"]] = [];
                }

                $scope.promotions[item["promotion"]].push(item);

              }

            }

            $scope.loading++;

            console.log($scope.menu_items,$scope.promotions,$scope.promotion_costs);

          }

        }
      }, function errorCallback(response) {
        console.log("rest fail",response);
        if(response && response["status"] < 0) {
          alert("Please check internet connection and try again.");
        }
        $scope.loading++;
      });


      if($localStorage.user.type == 1 && $localStorage.user.username == $scope.owner){

        $scope.updateOrders = function(){
          $scope.loading--;
          $http.get(serverURL+"?type=1&job=10&status=0&token="+$localStorage.user.token)
          .then(function successCallback(response) {
            console.log("pendding orders",response);

            if(response && response["data"]) {
              $scope.orders = response["data"];
              $scope.loading++;
            }

          }, function errorCallback(response) {
            console.log("pendding orders fail",response);

            if(response && response["status"] < 0){
              alert("Please check internet connection and try again.");
            }

          });
        };

        $scope.finishOrder = function(order){
          order.ErrorMessage = '';
          $http.get(serverURL + "?type=1&job=11&token="+$localStorage.user.token+"&ID="+order.ID)
          .then(function successCallback(response) {

            if(response["data"] && "message" in response["data"]){
              order.ErrorMessage = response["data"]["message"];
            } else {
              order.status = 1;
              $scope.updateOrders();
            }

          }, function errorCallback(response) {
            console.log("finish order Fail ",response);
            if(response && response["status"] < 0){
              alert("Please check internet connection and try again.");
            } else if(response["data"] && "message" in response["data"]){
              order.ErrorMessage = response["data"]["message"];
            }
          });
        }

        $scope.openOrder= function(orderID){
          $location.path('/order/'+orderID);
        }

        $scope.updateOrders();

        var intervalPromise = $interval(function () {
          $scope.updateOrders();
        }, 40000);
        $scope.$on('$destroy', function () { $interval.cancel(intervalPromise); });

      }

    });

    $scope.editRest = function(){
      $location.path('/restedit/'+$scope.owner+"/"+$scope.name);
    }

    $scope.addPromotionToCart = function(promotion){
      if($localStorage.user && $localStorage.user.type != 2) return;

      $http.get(serverURL + "?type=4&job=3&token="+$localStorage.user.token+"&promotion="+promotion+"&quantity=1")
      .then(function successCallback(response) {
        console.log("add promo to cart",response);

        $rootScope.loadSepet();

      }, function errorCallback(response) {
        console.log("add promo to cart Fail ",response);
        if(response && response["status"] < 0) {
          alert("Please check internet connection and try again.");
        }
      });

    }

    $scope.addItemToCart = function(item){
      if($localStorage.user && $localStorage.user.type != 2) return;

      $http.get(serverURL + "?type=4&job=2&token="+$localStorage.user.token+"&item="+item+"&quantity=1")
      .then(function successCallback(response) {
        console.log("add item to cart",response);

        $rootScope.loadSepet();

      }, function errorCallback(response) {
        console.log("add item to cart Fail ",response);
        if(response && response["status"] < 0) {
          alert("Please check internet connection and try again.");
        }
      });

    }

  }

}])
.service('rulesService',['$http','$localStorage',function($http,$localStorage){

  /* User Types

  0 = admin
  1 = rest owner
  2 = customer

  */

  /* Restaurant url
  /rest/:owner/:name
  */


  var service = {};

  service.mitypeToStr = function(type){
    switch (type) {
      case 0:
      return "Main Dish";
      case 1:
      return "Side Dish";
      default:
      return "Food";
    }
  }

  return service;
}]);
