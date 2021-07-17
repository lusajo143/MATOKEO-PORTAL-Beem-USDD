var express = require('express')

var app = express()

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

/**
 * Students:    Stimulation of student management system database containing
 *              student details and results
 */
var Students = [
    {
        id: 111,
        Kidato: 1,
        NenoSiri: 'AAA',
        Matokeo: 'MATH=90, PHY=80, CHEM=68, BIO=76, HIST=54, GEO=63, ENG=88, KISW=40, CIV=77, NAFASI=1'
    },
    {
        id: 112,
        Kidato: 1,
        NenoSiri: 'BBB',
        Matokeo: 'MATH=92, PHY=60, CHEM=67, BIO=30, HIST=40, GEO=50, ENG=82, KISW=40, CIV=07, NAFASI=2'
    },
    {
        id: 121,
        Kidato: 2,
        NenoSiri: 'CCC',
        Matokeo: 'MATH=90, PHY=80, CHEM=68, BIO=76, HIST=54, GEO=63, ENG=88, KISW=40, CIV=77, NAFASI=1'
    },
    {
        id: 122,
        Kidato: 2,
        NenoSiri: 'DDD',
        Matokeo: 'MATH=80, PHY=50, CHEM=78, BIO=88, HIST=74, GEO=43, ENG=98, KISW=90, CIV=37, NAFASI=2'
    },
    {
        id: 131,
        Kidato: 3,
        NenoSiri: 'EEE',
        Matokeo: 'MATH=55, PHY=40, CHEM=66, BIO=76, HIST=54, GEO=63, ENG=88, KISW=40, CIV=77, NAFASI=1'
    },
    {
        id: 141,
        Kidato: 4,
        NenoSiri: 'FFF',
        Matokeo: 'MATH=90, PHY=80, CHEM=68, BIO=76, HIST=54, GEO=63, ENG=88, KISW=40, CIV=77, NAFASI=1'
    },
]

app.post('/beem-challenge/ussd/matokeo', function(req, res) {
    
    let isCorrect = false // To check authentication
    let matokeo = '' // To hold student results


    // Authenticating student credetials and getting student result if correct credentials were provided
    for (let index = 0; index < Students.length; index++) {
        const element = Students[index];
        if (element.Kidato === req.body.Kidato && 
            element.id === req.body.Usajili &&
            element.NenoSiri === req.body.NenoSiri) {
                isCorrect = true
                matokeo += element.Matokeo
                break
            }
    }

    if (isCorrect) {
        res.json({Status: true, Matokeo: matokeo})
        console.log("Matokeo: "+matokeo)
    } else {
        res.json({Status: false})
        console.log("Wrong credentials...")
    }
})

app.listen(5000, () => {
    console.log("Server is running...")
})