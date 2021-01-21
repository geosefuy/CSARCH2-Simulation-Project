module.exports = {
    home: (req, res) => {
        res.render('simulation.ejs', {
            result: false,
        });
    },
    calculate: (req, res) => {
        //req.body using name

        
        res.render('simulation.ejs', { // Pass data to front end
            result: true,
        });
    },
}