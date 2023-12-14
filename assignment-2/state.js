export function State() {
    this.actions = {};
    this.subscriptions = [];
    this.history = [];

}

State.prototype.subscribe = function(element, action, callback) {
    this.subscriptions[action] = this.subscriptions[action] || [];
    this.subscriptions[action].push(function(data) {
        callback.apply(element, data);
    });
}

State.prototype.dispatch = function(action, data) {
    data = data || [];

    // Store history of actions (not strictly neccessary)
    this.history.push([action, data]);

    // Call action reducers
    if ("function" === typeof this[action]) {
        this[action].apply(this, data);
    }

    // Add the action and state as final arguments
    data.push(action);
    data.push(this);

    // Call subscribers
    this.subscriptions[action] = this.subscriptions[action] || [];
    this.subscriptions[action].forEach(
        function(subscription) {
            subscription(data);
        }
    );

    this.saveState();
}

State.prototype.saveState = function() {
    const stateToSave = {
        todos: this.todos
    };
    localStorage.setItem('state', JSON.stringify(stateToSave));
}

State.prototype.loadState = function() {
    const savedState = localStorage.getItem('state');
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        parsedState.todos.forEach((todo) => {
            this.dispatch('addTodo', [todo])
        })
    }
}