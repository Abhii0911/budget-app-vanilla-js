//writing Module to control our budget data using IIFE
var budgetController = (function(){

    var Expense = function(id,description,value, date){
        this.id=id;
        this.description = description;
        this.value = value;
        this.date = date;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0 ){
            this.percentage = Math.round((this.value / totalIncome) *100)
        }else { 
            this.percentage = -1;
        }
    }
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }


    var Income = function(id,description,value, date){
        this.id=id;
        this.description = description;
        this.value = value;
        this.date = date;
    };

    var calculatetotal= function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum= sum + cur.value
        });
        data.totals[type] = sum;
    }
    // var allExpenses = []
    // var allIncomes = []
    // var totalExpenses = 0
    var data = {
        allItems:{
            exp : [],
            inc: []
        },
        totals:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage : -1//initially non-existence
    }
return {
    addItem: function(type, des, val, date){
        var newItem, ID;

        //creating ID
        if(data.allItems[type].length > 0){
            ID= data.allItems[type][data.allItems[type].length-1].id + 1;
        }
        else{
            ID = 0;
        }
       

        if(type === "exp"){
            newItem = new Expense(ID, des, val, date) 
        }
        else if(type === "inc"){
            newItem = new Income(ID, des, val, date)
        }
        //push an object to the array 
        data.allItems[type].push(newItem)
        
        return newItem;
    },
    

    calculateBudget: function(){
        // calculate total income and expense
        calculatetotal('exp');
        calculatetotal('inc');

        //calculate the budget: income - expenses
        data.budget = data.totals.inc - data.totals.exp; 

        //calculate percentage of income that we spent
        if(data.totals.inc > 0){
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100 );
        }
        else{
            data.percentage = -1
        }
    },

    calculatePercentages : function(){
        data.allItems.exp.forEach(function(curr){
            curr.calcPercentage(data.totals.inc)
        }) ;
    },

    getPercentages : function(){
       var allPerc = data.allItems.exp.map(function(cur){
            return cur.getPercentage();
        })
        return allPerc;
    },

    getBudget: function(){
        return {
            budget: data.budget,
            percentage: data.percentage,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp
        }
    },

    deleteItem: function(type, id){
        var ids, index;
        //map returns a new array
        ids = data.allItems[type].map(function(curr){
            return curr.id 
        })
        index = ids.indexOf(id);

        if(index !== -1){
            data.allItems[type].splice(index, 1)
        }
    },

    testing: function(){
        console.log(data)//printing our data structure
    },
} 

})();//calling the IIFE here
//end of budgetController module



//creating another module to control our UI which will be independant of other modules
var UIController = (function(){
    var DomStrings= {
        inputType: ".add__type",
        inputDescription : ".add__description",
        inputValue : ".add__value",
        inputDate: ".add__date",
        inputBtn : ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer : ".expenses__list",
        budgetLabel : ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel : ".budget__expenses--value",
        percentageLabel : ".budget__expenses--percentage",
        container: ".container",
        expensesPercantageLabel :".item__percentage",
        dateLabel : ".budget__title--month"

    };

    var formatNumbers = function(num,type){
        var numSplit, int, dec;
         num = Math.abs(num);
         num = num.toFixed(2);

         numSplit = num.split('.');
         int = numSplit[0]; //integer part of the num
         dec = numSplit[1]; //decimal part 

         if(int.length > 3){
             int = int.substr(0,int.length-3) + "," + int.substr(int.length - 3, 3);
         }
         
         return (type === "exp" ? '-' : '+') + ' ' + int + '.' + dec; 
    };

    var NodeListForEach = function(list, callback){
        for(var i= 0; i<list.length;i++){
            callback(list[i], i)
        }
    };

    return {
        getInput: function(){
            return {
                type : document.querySelector(DomStrings.inputType).value, //either inc or exp
                description :document.querySelector(DomStrings.inputDescription).value,
                value : parseFloat(document.querySelector(DomStrings.inputValue).value),
                date : document.querySelector(DomStrings.inputDate).value
            }
        },

        getDomStrings: function(){
            return DomStrings;
        },

        addListItem: function(obj, type){
            var html, newHtml, element;
            //create html string
            if(type ==="inc"){
                element = DomStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="item__date">%date%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            else if(type === "exp"){
                element = DomStrings.expensesContainer
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="item__date">%date%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            //replace placeholder text with actual text
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description)
            newHtml = newHtml.replace('%value%', formatNumbers(obj.value, type) )
            newHtml = newHtml.replace("%date%", obj.date)
            //insert html item to DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
        },

        clearFields : function(){
            var fields;
            fields = document.querySelectorAll(DomStrings.inputDescription + ',' + DomStrings.inputValue + ',' + DomStrings.inputDate) //returns a LIST not array
            

            //convert list to an array
            var fieldsArr = Array.prototype.slice.call(fields) //calling array function constructor as slice method is present there
            
            fieldsArr.forEach(function(curr, index, array) {
                if(index === 2){
                    curr.value = "2000-01-01"
                }
                else{
                    curr.value= ""
                }
            });
            fieldsArr[0].focus( )

        },
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = "inc" : type = "exp"
            document.querySelector(DomStrings.budgetLabel).textContent= formatNumbers(obj.budget, type);
            document.querySelector(DomStrings.incomeLabel).textContent= formatNumbers(obj.totalInc, "inc");
            document.querySelector(DomStrings.expensesLabel).textContent= formatNumbers(obj.totalExp, "exp");
            
            if(obj.percentage > 0){
                document.querySelector(DomStrings.percentageLabel).textContent= obj.percentage + "%";
            }else{
                document.querySelector(DomStrings.percentageLabel).textContent= "---";
            }
        },

        deleteListItem: function(selectorId){
            var elementSelected= document.getElementById(selectorId);
            elementSelected.parentNode.removeChild(elementSelected);
        },

        displayPercentages : function(percentages){
            var fields = document.querySelectorAll(DomStrings.expensesPercantageLabel);
            
            //converting nodelist to array
            NodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + "%"
                }else{
                    current.textContent = "---"
                }
                
            })
        },

        displayMonth: function(){
            var now, year, month, months;
            
            now = new Date();
            months= ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul" ,"Aug", "Sep", "Oct", "Nov", "Dec"]
            year=  now.getFullYear();
            month= now.getMonth()

            document.querySelector(DomStrings.dateLabel).textContent = months[month] + " " + year; 
        },    
        
        changeType: function(){
            var fields = document.querySelectorAll(
                DomStrings.inputType + ',' +
                DomStrings.inputDescription + "," + 
                DomStrings.inputValue);

            NodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DomStrings.inputBtn).classList.toggle('red')
        }

    }
})();



//creating third module
var appController = (function(budgetCtrl, UICtrl){

    var setupEventListeners= function(){
        var DOM = UICtrl.getDomStrings()
        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem)

        document.addEventListener('keydown', function(e){
        if(e.key === "Enter" || e.code == 'Enter'){
            ctrlAddItem();
         }
      });

      document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem); //this handler gets attached to all the child element of this selected element

      document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changeType)
    };
    
    var updateBudget  =function(){
    // 4.   Calculate the budget
        budgetCtrl.calculateBudget()

        // 2.   Return the budget 
        var budget= budgetCtrl.getBudget()

        // 5.   display budget on UI
        UICtrl.displayBudget(budget)
    }

    var ctrlAddItem = function(){

        var input, newItem
    // 1.   Get field input data
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
    
            // 2.   Add iem to budget controller
                newItem = budgetCtrl.addItem(input.type, input.description, input.value, input.date)

            // 3.   Add item to UI
                UICtrl.addListItem(newItem, input.type)
                
            //  clear the fields
                UICtrl.clearFields();
                // budgetCtrl.testing();

            // 4.   calculate and updat budget
                updateBudget();

            //5.    calculate and update the percenatges
            updatePercentages()
            }
    };

    //Performing Event Delegation
    var ctrlDeleteItem = function(event){
        console.log(event.target)
        var itemID, splitId, type,id;
        //when we click on the cross icon with class "ion-ios-close-outline", we move to its 4th parent with class "item".   
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; //to do DOM traversing and go to parent of the button we click as and will return id of 'inc-0' or "inc-1" or "exp-0" or "exp-1" or etc

        //Only the button's 4th parent have id(so will return 'true') else everyone else's id will be "null" which will return false and not move further
        if(itemID){//itemID is a string here like 'inc-0'
            splitId = itemID.split('-');
            type = splitId[0]; //string "inc" will get stored to 'type' variable
            id= parseInt(splitId[1]); //string "0 or 1 or etc" will be converted to number and then stored to 'id'  variable here

            //1.    delete item from DS
            budgetCtrl.deleteItem(type, id)

            //2.    delete item from UI
            UICtrl.deleteListItem(itemID)
            
            //3     update and show the new budget
            updateBudget();
            
            //5.    calculate and update the percenatges
            updatePercentages()

        }
    };

    var updatePercentages = function(){
        //1. calculate the percentage
        budgetCtrl.calculatePercentages();
        //2.    red percentages from budget controller
        var percentages = budgetCtrl.getPercentages(); 
        //3.    update UI with new percentages
        UICtrl.displayPercentages(percentages);
    }

    return {
        init : function(){
            console.log("app has started");
            UICtrl.displayMonth()
            UICtrl.displayBudget({
                budget: 0,
                percentage: -1,
                totalInc: 0,
                totalExp: 0
            })
            setupEventListeners();
        }
    }

})(budgetController, UIController);//invoking this function

appController.init(); 