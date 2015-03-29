(function () {

    angular
        .module('menu', ['ngMaterial', 'wallabag-restapi'])
        .controller('MenuController', ['$mdSidenav', '$mdBottomSheet', '$log', '$q', '$location', '$rootScope',
            MenuController
        ]);

    /**
     * Menu Controller for Wallabag App
     * @param $mdSidenav
     * @param $mdBottomSheet
     * @constructor
     */
    function MenuController($mdSidenav, $mdBottomSheet, $log, $q, $location, $rootScope) {
        var self = this;

        self.selected = null;
        self.items = [];
        self.selectItem = selectItem;
        self.toggleMenuList = toggleMenuList;
        self.addEntry = addEntry;
        self.searchEntry = searchEntry;


        // Load all menu Items

        self.items = [
            {
                name: 'Unread',
                icon: 'unread',
                url: '/unread'
            },
            {
                name: 'Favorites',
                icon: 'favorite',
                url: '/favorite'
            },
            {
                name: 'Archive',
                icon: 'archive'
            },
            {
                name: 'Tags',
                icon: 'tag'
            },
            {
                name: 'Config',
                icon: 'config'
            },
            {
                name: 'About',
                icon: 'about'
            }
        ];

        // *********************************
        // Internal methods
        // *********************************

        function searchEntry() {
            console.log('click searchEntries ' + $rootScope.login);

        }

        function addEntry() {
            console.log('click addEntry ' + $rootScope.login);
            $location.path("/addEntry")

        }

        /**
         * First hide the bottomsheet IF visible, then
         * hide or Show the 'left' sideNav area
         */
        function toggleMenuList() {
            var pending = $mdBottomSheet.hide() || $q.when(true);
            pending.then(function () {
                $mdSidenav('left').toggle();
            });
        }

        /**
         * Select the current Item
         * @param menuId
         */
        function selectItem(menuId) {
            console.log(menuId);
            self.selected = angular.isNumber(menuId) ? self.items[menuId] : menuId;
            $location.path(self.selected.url);
            self.toggleMenuList();
        }


    }

    angular.module('menu')
        .controller('LoginController', [
             '$mdSidenav', '$mdBottomSheet', '$log', '$q','$rootScope', '$location', 'EntryService', '$controller',
            LoginController
        ]);

    function LoginController($mdSidenav, $mdBottomSheet, $log, $q, $rootScope, $location, EntryService, $controller) {
        var self = this;

        self.username = 'wallabag';
        self.password = 'wallabag';
        self.login = login;

        function login(){
            if (self.username && self.password) {
                $rootScope.login = self.username;
                $rootScope.password = self.password;
                EntryService.getSalt({
                    login: self.username
                }, function (response) {
                    $rootScope.salt = response;
                    var MenuController = $controller('MenuController');
                    MenuController.selectItem(0);

                });


            } else {
                console.log('enter login');
            }
        }

    }

    angular.module('menu')
        .controller('UnreadController', function ($rootScope, unreadURLs) {
        var ctrl = {
            unreadUrlList: unreadURLs,
            username: $rootScope.username
        };


        return ctrl;
    });

    angular.module('menu')
        .controller('AddEntryController', function ($rootScope, EntryService, $location) {
            var ctrl = {
                username: $rootScope.login,
                url: '',
                title:'',
                tags: ''
            };
            ctrl.add = function () {
                EntryService.addEntry({
                        'url': ctrl.url,
                        'title': ctrl.title,
                        'tags': ctrl.tags
                    },
                    function (response) { //success
                        console.log('url added:' + ctrl.url);
                        $location.path('/unread');

                    });
            };

            return ctrl;
        });

    angular.module('menu')
        .controller('entryController', function ($rootScope, EntryService, $scope, $timeout, $mdBottomSheet) {
            var ctrl = {
                username: $rootScope.username,
                url: '',
                title: ''
            };

            $scope.showGridBottomSheet = function ($event, articleId) {
                $scope.alert = '';
                $mdBottomSheet.show({
                    templateUrl: 'src/entries/view/bottom-grid.html',
                    controller: 'GridBottomSheetCtrl',
                    targetEvent: $event
                }).then(function (clickedItem) {
                    $scope.alert = articleId + ' ' + clickedItem.name + ' clicked!';
                    EntryService.updateEntry({id: articleId},clickedItem.update,
                            function(succes){                    
                                console.log("update succes "+ succes);               
                            },
                            function(error){
                                console.log("update error "+ error);
                            }
                    );
                    
                });
            };

            ctrl.favoriteEntry = function () {

            };
            return ctrl;
        })

    angular.module('menu')
        .controller('GridBottomSheetCtrl', function ($scope, $mdBottomSheet) {
            $scope.items = [
                {
                    name: 'Readed',
                    icon: 'read',
                    update: {archive: true }
                },
                {
                    name: 'Favorite',
                    icon: 'favorite',
                    update: {star: true }
                },
                {
                    name: 'Tags',
                    icon: 'tag'
                },
                {
                    name: 'Delete',
                    icon: 'delete'
                },
                {
                    name: 'Original',
                    icon: 'link'
                },
            ];
            $scope.listItemClick = function ($index) {
                var clickedItem = $scope.items[$index];
                $mdBottomSheet.hide(clickedItem);
            };
        })

})();