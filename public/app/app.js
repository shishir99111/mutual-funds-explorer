/**
 * The demo application that will allow to showcase the use of 
 * angular-dynamic-layout
 */
var gridApp = angular.module('gridApp', ['dynamicLayout']);

/**
 * An example of controller that can be used to manipulate a specific card
 *
 * This broadcasts a layout event and catched the callback when all 
 * animations are completed
 */
gridApp.controller('cardController', ['$scope', '$rootScope', '$timeout', '$http',
  function ($scope, $rootScope, $timeout, $http) {}
]);

/**
 * The main controller that is responsible for created the cards, filters, 
 * rankers
 */
gridApp.controller('GridContainer', ['$scope', '$http', function ($scope, $http) {
  $scope.pageLimit = 700;
  $scope.sortOrder = 'Date';
  $scope.activePage = 1;
  $scope.isLoading = true;

  function getCardData(params) {
    $scope.cards = [];
    $http.get("/funds", { params: params })
      .then(function (response) {
        $scope.nOfPage = parseInt(response.data.totalRecords / 700) + 1;
        $scope.filteredRecords = response.data.filteredRecords;
        $scope.totalRecords = response.data.totalRecords;
        if (response.data.data.length !== 0) {
          response.data.data.forEach(function (fund) {
            $scope.cards.push({
              id: 1,
              template: "app/partials/card.html",
              tabs: ["home", "work"],
              data: {
                "name": fund['Scheme Name'],
                "value": fund['Net Asset Value'],
                "date": fund["Date"],
              }
            });
          })
        } else {
          $scope.noData = true;
        }
        $scope.isLoading = false;
      });
  }

  // first call to populate data
  getCardData({ page: 1, limit: $scope.pageLimit, sort: $scope.sortOrder });

  // get data of page specified
  $scope.nextPage = function (page) {
    $scope.isLoading = true;
    $scope.activePage = page;
    getCardData({ page: page, limit: $scope.pageLimit, sort: $scope.sortOrder, search: $scope.searchText });
  }

  // sorting of data on the basis of given parameter
  $scope.sortData = function (param) {
    $scope.isLoading = true;
    $scope.sortOrder = param;
    getCardData({ page: $scope.activePage, limit: $scope.pageLimit, sort: $scope.sortOrder, search: $scope.searchText });
  }

  // populating data on the basis of fund name
  $scope.search = function () {
    $scope.isLoading = true;
    $scope.activePage = 1;
    getCardData({ page: $scope.activePage, limit: $scope.pageLimit, sort: $scope.sortOrder, search: $scope.searchText });
  }
}]);