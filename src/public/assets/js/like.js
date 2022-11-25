$(document).ready(async function () {
  $('#like').click(async () => {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })
    let { isConfirmed } = await swalWithBootstrapButtons.fire({
      title: 'Você quer votar nesse bot?',
      text: "Você só vai poder votar novamente daqui 12 horas.",
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Sim, Like'
    })
    if (!isConfirmed) return;
    let botid = location.href.split(location.host)[1].replace('/bots/like/', '').replace('/', '');
    let req = await fetch(`/api/like/${botid}`, {
      method: "PATCH",
      headers: { 'Content-Type': 'application/json' }
    })
    req = await req.json()
    if (req.success) {
      await swalWithBootstrapButtons.fire({
        title: 'Sucesso',
        text: 'Você curtiu esse bot !',
        icon: 'success'
      })
      location.href = `/bots/${botid}`
    } else {
      let hours = 11 - Math.floor(req.time / 3600000);
      let minutes = 60 - Math.ceil((req.time  / 60000) % 60);
      await swalWithBootstrapButtons.fire({
        title: 'Opa',
        text: `Você só pode votar daqui ${hours} houras e ${minutes} minutos`,
        icon: 'error'
      })
      location.href = `/bots/${botid}`
    }
  })
})
