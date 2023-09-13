import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const file = this.document.querySelector(`input[data-testid="fileInput"]`)
    file.addEventListener("change", this.handleChangeFile)
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }

  handleChangeFile = () => {
    const fileInput = this.document.querySelector(`input[data-testid="fileInput"]`);
    
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      console.error("Aucun fichier sélectionné.");
      return;
    }
  
    const fileName = fileInput.files[0].name;
    const regexExtensionGranted = /\.(jpg|jpeg|png)$/i;
    const errorExtension = document.querySelector(".errorType");
  
    if (!regexExtensionGranted.test(fileName)) {
      errorExtension.style.color = "red";
      errorExtension.innerText = "Extensions autorisées : .jpg, .jpeg, .png";
      fileInput.value = "";
    } else {
      errorExtension.style.display = 'none';
      return;
    }
  }
  handleSubmit = e => {
    e.preventDefault()
    e.target.querySelector(`input[data-testid="datepicker"]`).value
    const email = JSON.parse(localStorage.getItem("user")).email
    const file = this.document.querySelector(`input[data-testid="fileInput"]`).files[0]
        
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: file.name,
      status: 'pending'
    }
    const formData = new FormData()
    formData.append('file', file)
    formData.append('email', email)
    this.store
        .bills()
        .create({
          data: formData,
          headers: {
            noContentType: true,
          }
        })
        .then(({fileUrl, key}) => {
          this.billId = key
          this.fileUrl = fileUrl
          this.fileName = file.name
          
          this.updateBill(bill)
          this.onNavigate(ROUTES_PATH['Bills'])
        }).catch(error => console.error(error))
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}