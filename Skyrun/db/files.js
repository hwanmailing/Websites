class filesComponent {
  constructor() {
    this.baseUrl = "/api/files";
    this.items = [];
    this.currentItem = null;
    this.isEditing = false;
    this.modal = null;
    this.form = null;
    this.showCreateModal = this.showCreateModal.bind(this);
    this.editItem = this.editItem.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.init();
  }
  async init() {
    await this.loadItems();
    this.render();
    this.modal = new bootstrap.Modal(document.getElementById("filesModal"));
    this.form = document.getElementById("filesForm");
    const addButton = document.querySelector('[data-action="create"]');
    if (addButton) {
      addButton.addEventListener("click", this.showCreateModal);
    }
  }
  async loadItems() {
    try {
      const response = await fetch(this.baseUrl + "/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      });
      const data = await response.json();
      if (data.success) {
        this.items = data.data;
      } else {
        throw new Error(data.error || "Failed to fetch data");
      }
    } catch (error3) {
      console.error("Error fetching data:", error3);
      throw error3;
    }
  }
  async getById(idx) {
    try {
      const response = await fetch(this.baseUrl + "/get?idx=" + idx, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      });
      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      throw new Error(data.error || "Failed to fetch data");
    } catch (error3) {
      console.error("Error fetching data:", error3);
      throw error3;
    }
  }
  async create(data) {
    try {
      const response = await fetch(this.baseUrl + "/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.success) {
        await this.loadItems();
        this.modal.hide();
        this.form.reset();
        return result.data;
      }
      throw new Error(result.error || "Failed to create data");
    } catch (error3) {
      console.error("Error creating data:", error3);
      throw error3;
    }
  }
  async update(idx, data) {
    try {
      const response = await fetch(this.baseUrl + "/put?idx=" + idx, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.success) {
        await this.loadItems();
        this.modal.hide();
        this.form.reset();
        return result.data;
      }
      throw new Error(result.error || "Failed to update data");
    } catch (error3) {
      console.error("Error updating data:", error3);
      throw error3;
    }
  }
  async delete(idx) {
    try {
      const response = await fetch(this.baseUrl + "/delete?idx=" + idx, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      });
      const result = await response.json();
      if (result.success) {
        await this.loadItems();
        return result.data;
      }
      throw new Error(result.error || "Failed to delete data");
    } catch (error3) {
      console.error("Error deleting data:", error3);
      throw error3;
    }
  }
  async deleteItem(id) {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await this.delete(id);
      } catch (error3) {
        console.error("Error deleting item:", error3);
      }
    }
  }
  editItem(item) {
    this.currentItem = item;
    this.isEditing = true;
    this.form.reset();
    Object.keys(item).forEach((key) => {
      const input = this.form.querySelector('[name="' + key + '"]');
      if (input) {
        input.value = item[key];
      }
    });
    this.modal.show();
  }
  handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(this.form);
    const item = {};
    formData.forEach((value, key) => {
      item[key] = value;
    });
    if (this.isEditing) {
      this.update(this.currentItem.id, item);
    } else {
      this.create(item);
    }
  }
  showCreateModal() {
    this.currentItem = null;
    this.isEditing = false;
    this.form.reset();
    this.modal.show();
  }
  render() {
    const container = document.getElementById("filesContainer");
    if (!container)
      return;
    container.innerHTML = `
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Files</h5>
                    <button class="btn btn-primary" data-action="create">
                        Add New
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Idx</th><th>Project_idx</th><th>Folder_idx</th><th>Name</th><th>Storage_path</th><th>Created_at</th><th>Updated_at</th>
                                    <th class="table-actions">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.items.map((item) => `
                                    <tr>
                                        <td>${item.idx}</td><td>${item.project_idx}</td><td>${item.folder_idx}</td><td>${item.name}</td><td>${item.storage_path}</td><td>${item.created_at}</td><td>${item.updated_at}</td>
                                        <td>
                                            <button class="btn btn-sm btn-info" data-action="edit" data-item='${JSON.stringify(item)}'>
                                                Edit
                                            </button>
                                            <button class="btn btn-sm btn-danger" data-action="delete" data-id="${item.id}">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="filesModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${this.isEditing ? "Edit" : "Create"} ___TABLE_TITLE___</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="filesForm">
                                
                    <div class="form-group">
                        <label for="project_idx">Project_idx</label>
                        <input type="text" class="form-control" id="project_idx" name="project_idx" required>
                    </div>
                    <div class="form-group">
                        <label for="folder_idx">Folder_idx</label>
                        <input type="text" class="form-control" id="folder_idx" name="folder_idx" required>
                    </div>
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" class="form-control" id="name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="storage_path">Storage_path</label>
                        <input type="text" class="form-control" id="storage_path" name="storage_path" required>
                    </div>
                    <div class="form-group">
                        <label for="updated_at">Updated_at</label>
                        <input type="text" class="form-control" id="updated_at" name="updated_at" required>
                    </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                    <button type="submit" class="btn btn-primary">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    this.form = document.getElementById("filesForm");
    this.form.addEventListener("submit", this.handleSubmit);
    container.querySelectorAll("[data-action]").forEach((button) => {
      const action = button.dataset.action;
      if (action === "edit") {
        button.addEventListener("click", () => {
          const item = JSON.parse(button.dataset.item);
          this.editItem(item);
        });
      } else if (action === "delete") {
        button.addEventListener("click", () => {
          const id = button.dataset.id;
          this.deleteItem(id);
        });
      }
    });
    const closeButtons = container.querySelectorAll('[data-bs-dismiss="modal"]');
    closeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.modal.hide();
      });
    });
  }
}
const filesComponent_ = new filesComponent();