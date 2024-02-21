import {
    Button,
    Card,
    Container,
    Row,
    Col,
    Input,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ButtonGroup,
    Alert
} from "reactstrap";
import { useState, useEffect } from "react";
import {
    TaskService,
    Task
} from "@genezio-sdk/todo-list-ts_eu-central-1";
import { useNavigate } from "react-router-dom";
import { AuthService } from "@genezio/auth";
import { GenezioError } from "@genezio/types";

export default function AllTasks() {
    const navigate = useNavigate();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [modalAddTask, setModalAddTask] = useState(false);
    const toggleModalAddTask = () => {
        setModalAddTask(!modalAddTask);
        setTaskTitle("");
    };

    const [error, setError] = useState("");
    const [alertErrorMessage, setAlertErrorMessage] = useState<string>("");

    const [taskTitle, setTaskTitle] = useState("");

    useEffect(() => {
        AuthService.getInstance().userInfo().catch((e) => {
            if (e.code === 401) {
                navigate("/login");
            }
        })
    }, [navigate]);

    useEffect(() => {
        TaskService.getAllTasksByUser().then((tasks: Task[]) => {
            setTasks(tasks);
        }).catch((error) => {
            if (error.code === 401) {
                navigate("/login");
            } else if (error instanceof Error) {
                setAlertErrorMessage(`Unexpected error: ${error.message
                        ? error.message
                        : "Please check the backend logs in the project dashboard - https://app.genez.io."
                    }`
                );
            }
        })
    }, [navigate]);

    async function handleDelete(id: number) {
        await TaskService.deleteTask(id).then(() => {
            navigate(0);
        }).catch((error) => {
            navigate(0);
            setAlertErrorMessage(
                `Unexpected error: ${error.message
                    ? error.message
                    : "Please check the backend logs in the project dashboard - https://app.genez.io."
                }`
            );
        });
    }

    async function handleEdit(id: number, title: string, solved: boolean) {
        console.log(id, title, solved);
        await TaskService.updateTask(id, title, solved).then(() => {
            const newTasks = tasks.map((task) => {
                if (task.id === id) {
                    task.title = title;
                    task.solved = solved;
                }
                return task;
            });
            setTasks(newTasks);
        }).catch((error) => {
            if (error.code === 401) {
                navigate("/login");
            } else if (error instanceof Error) {
                setAlertErrorMessage(
                    `Unexpected error: ${error.message
                        ? error.message
                        : "Please check the backend logs in the project dashboard - https://app.genez.io."
                    }`
                );
            }
        });
    }

    async function handleAdd(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        if (!taskTitle) {
            setError("Title is mandatory");
            return;
        }
        try {
            const newTask = await TaskService.createTask(taskTitle);
            setTasks([...tasks, newTask]);
            setTaskTitle("");
            toggleModalAddTask();
        } catch (error) {
            if (error instanceof Error) {
                setAlertErrorMessage(
                    `Unexpected error: ${error.message
                        ? error.message
                        : "Please check the backend logs in the project dashboard - https://app.genez.io."
                    }`
                );
            } else if (error instanceof GenezioError) {
                if (error.code === 401) {
                    navigate("/login");
                }
            }
        }
    }

return alertErrorMessage != "" ? (
    <Row className="ms-5 me-5 ps-5 pe-5 mt-5 pt-5">
        <Alert color="danger">{alertErrorMessage}</Alert>
        </Row>
    ) : (
        <>
            <Modal isOpen={modalAddTask} toggle={toggleModalAddTask}>
                <ModalHeader toggle={toggleModalAddTask}>Add new task</ModalHeader>
                <form>
                    <ModalBody>
                        <span className="text-danger">{error}</span>
                        <div className="mb-3">
                            <label>Task Title</label>
                            <Input
                                className="form-control"
                                placeholder="Title"
                                autoComplete="Title"
                                value={taskTitle}
                                onChange={(e) => setTaskTitle(e.target.value)}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={(e) => handleAdd(e)} type="submit">
                            Add
                        </Button>
                        <Button color="secondary" onClick={toggleModalAddTask}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </form>
            </Modal>
            <Container className="mt-2">
                <Card className="p-4 mt-2">
                    <Row className="mt-2">
                        <Col sm="11">
                            <h3>All Tasks</h3>

                            <Row>
                                <Col sm="12">
                                    {tasks.map((task) => (
                                        <div key={task.id} className="mb-3">
                                            <p className="mb-0">
                                                <span className="h4">{task.title}</span> -{" "}
                                                {task.solved ? "Solved" : "Not Solved"}
                                            </p>
                                            <ButtonGroup aria-label="Basic example">
                                                <Button
                                                    color="danger"
                                                    onClick={() => handleDelete(task.id)}
                                                >
                                                    Delete Task
                                                </Button>
                                                <Button
                                                    color="primary"
                                                    onClick={() =>
                                                        handleEdit(task.id, task.title, !task.solved)
                                                    }
                                                >
                                                    {task.solved ? "Mark as Unsolved" : "Mark as Solved"}
                                                </Button>
                                            </ButtonGroup>
                                        </div>
                                    ))}
                                </Col>

                                <Col sm="3" className="mt-4">
                                    <Button
                                        color="primary"
                                        onClick={() => {
                                            toggleModalAddTask();
                                        }}
                                    >
                                        Add Task
                                    </Button>
                                </Col>
                            </Row>
                        </Col>
                        <Col sm="1" className="text-right">
                            <Button
                                color="primary"
                                onClick={() => {
                                    AuthService.getInstance().logout();
                                    navigate("/login");
                                }}
                            >
                                Logout
                            </Button>
                        </Col>
                    </Row>
                </Card>
            </Container>
        </>
    );
}
