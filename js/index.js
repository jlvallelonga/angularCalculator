var myApp = angular.module("myApp", []);

myApp.directive('keyboardDir', function($document) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs, controller) {
      $($document).keydown(function(event) {
        var code = event.keyCode || event.which;
        scope.keyPressed(code);
      });
    }
  };
});

myApp.controller('CalculatorAppCtrl', function CalculatorAppCtrl($scope) {
  $scope.showPowerControls = true; //by default, show the power controls
  $scope.calculations = [];
  
  $scope.keyPressed = function(code) {
    //operator button pressed
    if (code === 107) {
      $scope.setOperator('+');
    }
    if (code === 109) {
      $scope.setOperator('-');
    }
    if (code === 106) {
      $scope.setOperator('*');
    }
    if (code === 111) {
      $scope.setOperator('/');
    }
    
    //enter pressed
    if (code === 13) {
      $scope.setResult();
    }
    
    //delete pressed
    if (code === 46) {
      $scope.clearAll();
    }
    
    //decimal point pressed
    if (code === 110) {
      $scope.appendToOperand('.');
    }
    
    //number key was pressed
    if (code > 57) {
      code = code - 48;
    }
    if (code >= 48 && code <= 57) {
      $scope.appendToOperand((code - 48).toString());
    }
    $scope.$apply();
  };
  
  $scope.appendResultToOperand = function(calcStr) {
    var resultVal = calcStr.substring(calcStr.indexOf('=') + 2);
    if ($scope.operator === null) {
      $scope.first = null;
    }
    else {
      $scope.second = null;
    }
    $scope.appendToOperand(resultVal);
  };
  
  $scope.appendToOperand = function(value) {
    if ($scope.operator === null) {//append to the first operand if there's no operator yet
      $scope.first = $scope.first === null ? value : $scope.first + value;
      $scope.output = $scope.first; //show the operand in the output
    }
    else {//otherwise append to the second operand
      $scope.second = $scope.second === null ? value : $scope.second + value;
      $scope.output = $scope.second; //show the operand in the output
    }
  };

  $scope.setOperator = function(operatorStr) {
    //if you've got an operator already then calculate the result before setting the next operator
    //  for things like 1+2*3 (you just pressed '*'). you need to calculate the result of 1+2 before you set the operator to '*'.
    if ($scope.operator !== null) {
      $scope.setResult();
    }
    $scope.copyResultToFirstOperand();
    $scope.operator = operatorStr;
  };

  $scope.setResult = function() {
    if ($scope.performCalculation($scope.first, $scope.second, $scope.operator) === 0) {
      //if there were no problems during calculation then...
      $scope.first = null;
      $scope.second = null;
      $scope.operator = null;
    }
    else {
      $scope.clearAllAllButResult(); //when errors occur, clearAll everything but the last result
    }
  };

  $scope.performCalculation = function(first, second, operator) {
    try {
      //do some validation first
      if (first === null ||
          second === null ||
          operator === null) { //if anything is null then you can't perform the calculation
        //but don't throw an error
        return;
      }
      if (!$.isNumeric(first) || !$.isNumeric(second)) { //if by chance anything isn't numeric then error
        throw "Error: non numeric operand";
      }
      //parse numbers from the operands
      first = parseFloat(first);
      second = parseFloat(second);
      //make calculations
      if (operator === '+') {
        $scope.result = first + second;
      }
      else if (operator === '-') {
        $scope.result = first - second;
      }
      else if (operator === '*') {
        $scope.result = first * second;
      }
      else if (operator === '/') {
        if (second !== 0) {
          $scope.result = first / second;
        }
        else { //if dividing by zero then error
          throw "Error: cannot divide by zero";
        }
      }
      $scope.calculations.push(first + ' ' + operator + ' ' + second + ' = ' + $scope.result);
      $scope.output = $scope.result;//set the output to the result
    }
    catch (err) {
      console.log(err); //log the error message to the console
      $scope.output = 'Error!'; //set the result to Error!
      return; //don't return 0
    }
    return 0; //if you've reached this point then everything went well
  };
  
  //only copies result to first operand if the first operand is null and the result is not
  $scope.copyResultToFirstOperand = function() {
    if ($scope.first === null && //if your first operand is null
        $scope.result !== null) { //and you have a result... 
      $scope.first = $scope.result; //then your result becomes your first operand
    }
  };

  //for when you press the +/- button
  $scope.reverseSignOfLastOperand = function() {
    $scope.copyResultToFirstOperand();
    if ($scope.second !== null) {//if you have a second operand then reverse the sign of it
      $scope.second = $scope.changeSign($scope.second);
      $scope.output = $scope.second;
    }
    else if ($scope.first !== null) { //otherwise reverse the sign of the first operand
      $scope.first = $scope.changeSign($scope.first);
      $scope.output = $scope.first;
    }
    //if you have neither operand then do nothing
  };

  //generically changes the sign of any string
  $scope.changeSign = function(value) {
    //change value to a string. so you don't have to deal with doing it multiple times
    value = value.toString();
    if (value.substr(0, 1) === '-') { //if there is a '-' at the beginning of the string
      value = value.substring(1); //chop off the '-' at the beginning
    }
    else {//otherwise add a '-' to the beginning
      value = '-' + value;
    }
    return value;
  };

  $scope.clearAllAllButResult = function() {
    $scope.first = null;
    $scope.second = null;
    $scope.operator = null;
  };

  $scope.clearAll = function() {
    $scope.first = null;
    $scope.second = null;
    $scope.operator = null;
    $scope.output = null;
    $scope.result = null;
  };

  $scope.clearAll();//clearAll the form when you first load the app
});