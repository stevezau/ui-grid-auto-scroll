(function() {
  'use strict';
  /**
   *  @ngdoc overview
   *  @name ui.grid.autoScroll
   *
   *  @description
   *
   * #ui.grid.autoScroll
   *
   *
   * This module provides auto scroll functionality to ui-grid
   *
   */
  var module = angular.module('ui.grid.autoScroll', ['ui.grid']);
  /**
   *  @ngdoc service
   *  @name ui.grid.autoScroll.service:uiGridAutoScrollService
   *
   *  @description Service for auto scroll features
   */
  module.service('uiGridAutoScrollService', ['uiGridConstants', '$timeout', function (uiGridConstants, $timeout) {

    var service = {

      /**
       * @ngdoc function
       * @name initializeGrid
       * @methodOf ui.grid.autoScroll.service:uiGridAutoScrollService
       * @description This method registers events and methods into the grid's public API
       */

      initializeGrid: function(grid, $scope) {
        service.defaultGridOptions(grid.options);

        if (!grid.options.enableAutoScroll) {
          return;
        }

        grid.autoScroll = {prevScrollPercent: 1};
        grid.api.core.on.scrollEnd($scope, service.handleScroll);
        grid.registerDataChangeCallback(service.autoScroll, [uiGridConstants.dataChange.ROW]);
      },


      defaultGridOptions: function (gridOptions) {
        //default option is true unless it was explicitly set to false
        /**
         *  @ngdoc object
         *  @name ui.grid.autoScroll.api:GridOptions
         *
         *  @description GridOptions for auto scroll feature, these are available to be
         *  set using the ui-grid {@link ui.grid.class:GridOptions gridOptions}
         */

        /**
         *  @ngdoc object
         *  @name enableAutoScroll
         *  @propertyOf  ui.grid.autoScroll.api:GridOptions
         *  @description Enable auto scrolling for this grid
         *  <br/>Defaults to true
         */
        gridOptions.enableAutoScroll = gridOptions.enableAutoScroll !== false;
      },

      /**
       * @ngdoc function
       * @name handleScroll
       * @methodOf ui.grid.autoScroll.service:uiGridAutoScrollService
       * @description Called whenever the grid scrolls, determines whether the grid should
       * scroll when new data is added
       * @param {object} args the args from the event
       */
      handleScroll:  function (args) {
        if (args.y) {
          args.grid.autoScroll.prevScrollPercent = args.y.percentage;
        }
      },

      /**
       * @ngdoc function
       * @name autoScroll
       * @methodOf ui.grid.autoScroll.service:uiGridAutoScrollService
       * @description Called whenever the new data is added, will scroll to the bottom
       * if the grid was previously at the bottom
       * @param {object} args the args from the event
       */
      autoScroll:  function (args) {
        // If autoScroll timer is running then cancel and scroll to the bottom
        if ($timeout.cancel(args.api.grid.autoScroll.scrollTimeout)) {
          args.api.core.scrollTo(args.api.grid.options.data[args.api.grid.options.data.length - 1]);
        }
        
        // Delay to allow new data items to be added to the grid before scrolling
        if (args.api.grid.autoScroll.prevScrollPercent > 0.99) {
          args.api.grid.autoScroll.scrollTimeout = $timeout(function () {
            args.api.core.scrollTo(args.api.grid.options.data[args.api.grid.options.data.length - 1]);
          }, 50);
        }
      }
    };
    return service;
  }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.autoScroll.directive:uiGridAutoScroll
   *  @element div
   *  @restrict A
   *
   *  @description Adds auto scroll to grid
   *
   *  @example
   <example module="app">
   <file name="app.js">
   var app = angular.module('app', ['ui.grid', 'ui.grid.autoScroll']);

   app.controller('MainCtrl', ['$scope', function ($scope) {
      var logCount = 1;

      $scope.gridOptions = {
        columnDefs: [
          {name: 'message'}
        ],
        data: []
      };

      var loadData = function(lines) {
        for (var i = 0; i < lines; i++) {
          $scope.gridOptions.data.push({'message': 'log message ' + logCount});
          logCount++;
        }
      };

      $scope.addData = function() {
        loadData(100);
      };

      loadData(30);

    }]);
   </file>
   <file name="index.html">
   <div ng-controller="MainCtrl">
   <div id="grid1" ui-grid="gridOptions" class="grid" ui-grid-auto-scroll></div>
   <button ng-click="addData()">Add more</button>
   </div>
   </file>
   </example>
   */

  module.directive('uiGridAutoScroll', ['uiGridAutoScrollService',
    function (uiGridAutoScrollService) {
      return {
        scope: false,
        require: '^uiGrid',
        compile: function($scope, $elm, $attr){
          return {
            pre: function($scope, $elm, $attr, uiGridCtrl) {
              uiGridAutoScrollService.initializeGrid(uiGridCtrl.grid, $scope);
            },
            post: function($scope, $elm, $attr) {
            }
          };
        }
      };
    }]);

})();
