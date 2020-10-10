const checkStatus = (response) => {
  if (response.ok) {
    return response;
  }
  throw new Error("Houston we have a problem");
};
const json = (response) => response.json();

class Task extends React.Component {
  render() {
    const { task, onDelete, onComplete } = this.props;
    const { id, content, completed } = task;
    return (
      <div className="row mb-1">
        <input
          className="d-inline-block mt-2"
          type="checkbox"
          onChange={() => onComplete(id, completed)}
          checked={completed}
        />
        <p className="col">{content}</p>
        <button className="btn btn-danger mx-2" onClick={() => onDelete(id)}>
          Delete
        </button>
      </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      new_task: "",
      tasks: [],
      filter: "all",
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
    this.fetchTasks = this.fetchTasks.bind(this);
    this.toggleComplete = this.toggleComplete.bind(this);
    this.toggleFilter = this.toggleFilter.bind(this);
  }

  componentDidMount() {
    this.fetchTasks();
  }

  fetchTasks() {
    // move the get tasks code into its own method so we can use it at other places
    fetch("https://altcademy-to-do-list-api.herokuapp.com/tasks?api_key=179")
      .then(checkStatus)
      .then(json)
      .then((response) => {
        console.log(response);
        this.setState({ tasks: response.tasks });
      })
      .catch((error) => {
        console.error(error.message);
      });
  }

  handleChange(event) {
    this.setState({ new_task: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    let { new_task } = this.state;
    new_task = new_task.trim();
    if (!new_task) {
      window.alert("Task is empty");
      return;
    }
    fetch("https://altcademy-to-do-list-api.herokuapp.com/tasks?api_key=179", {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task: {
          content: new_task,
        },
      }),
    })
      .then(checkStatus)
      .then(json)
      .then((data) => {
        this.setState({ new_task: "" });
        this.fetchTasks();
      })
      .catch((error) => {
        this.setState({ error: error.message });
        console.log(error);
      });
  }

  deleteTask(id) {
    if (!id) {
      return; // if no id is supplied, early return
    }
    fetch(
      `https://altcademy-to-do-list-api.herokuapp.com/tasks/${id}?api_key=179`,
      {
        method: "DELETE",
        mode: "cors",
      }
    )
      .then(checkStatus)
      .then(json)
      .then((data) => {
        this.fetchTasks();
      })
      .catch((error) => {
        this.setState({ error: error.message });
        console.log(error);
      });
  }

  toggleComplete(id, completed) {
    if (!id) {
      return; // early return if no id
    }
    const newState = completed ? "active" : "complete";
    fetch(
      `https://altcademy-to-do-list-api.herokuapp.com/tasks/${id}/mark_${newState}?api_key=179`,
      {
        method: "PUT",
        mode: "cors",
      }
    )
      .then(checkStatus)
      .then(json)
      .then((data) => {
        this.fetchTasks();
      })
      .catch((error) => {
        this.setState({ error: error.message });
        console.log(error);
      });
  }

  toggleFilter(e) {
    console.log(e.target.name);
    this.setState({
      filter: e.target.name,
    });
  }

  render() {
    const { new_task, tasks, filter } = this.state;

    return (
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h1>Brittany To Do</h1>
            {tasks.length > 0 ? (
              tasks
                .filter((task) => {
                  if (filter === "all") {
                    return true;
                  } else if (filter === "active") {
                    return !task.completed;
                  } else {
                    return task.completed;
                  }
                })
                .map((task) => {
                  return (
                    <Task
                      key={task.id}
                      task={task}
                      onDelete={this.deleteTask}
                      onComplete={this.toggleComplete}
                    />
                  );
                })
            ) : (
              <p>no tasks here</p>
            )}

            <div className="mt-3">
              <label className="mx-2">
                <input
                  className="mr-2"
                  type="checkbox"
                  name="all"
                  checked={filter === "all"}
                  onChange={this.toggleFilter}
                />
                All
              </label>
              <label className="mx-2">
                <input
                  className="mr-2"
                  type="checkbox"
                  name="active"
                  checked={filter === "active"}
                  onChange={this.toggleFilter}
                />
                Active
              </label>
              <label className="mx-2">
                <input
                  className="mr-2"
                  type="checkbox"
                  name="completed"
                  checked={filter === "completed"}
                  onChange={this.toggleFilter}
                />
                Completed
              </label>
            </div>

            <form onSubmit={this.handleSubmit} className="form-inline my-4">
              <input
                className="form-control mr-sm-2 mb-2"
                name="task"
                type="text"
                placeholder="Add new task here"
                value={new_task}
                required
                onChange={this.handleChange}
              />
              <button className="btn btn-primary">Add task</button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
