export default async function (req, res) {
  res.status(200)
  return res.json({
    status: 200,
    message: 'pong'
  })
}
