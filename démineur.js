/**
 *	Object principal du demineur
 *
 *	@param hauteur Hauteur du démineur (nombre de ligne)
 *	@param largeur Largeur du démineur (nombre de colonne)
 *	@param nbBombe Nombre de bombes dans le démineur
 **/
function Demineur(hauteur, largeur, nbBombe)
{
	/**
	 *	Hauteur du démineur
	 **/
	this.hauteur = hauteur;
	/**
	 *	Largeur du démineur
	 **/
	this.largeur = largeur;
	/**
	 * Nombre de bombe dans le démineur
	 * Vérification : au moins la moitié des Cases doivent être vides
	 **/
	this.bombe = (nbBombe > (largeur * hauteur) / 4)?parseInt((largeur * hauteur) / 4):nbBombe;
	/**
	 *	Nombre de bombe restantes dans le démineur
	 *	Nombre théorique, il dépend des drapeaux mit par le joueur (un drapeau posé = une bombe trouvée)
	 **/
	this.bombeRest = this.bombe;
	/**
	 *	Nombre de case dévoilées par l'utilisateur
	 **/
	this.caseDevoile = 0;
	/**
	 *	Chronomètre pour voir le temps mis pour résoudre le démineur
	 **/
	this.chrono = new Chrono;
	/**
	 *	Permet de savoir si le chronomètre est lancé ou non
	 **/
	this.chronoStart = false;
	/**
	 * Tableau contenant les Cases du démineur
	 **/
	this.grille = new Array(hauteur);
	
	/**
	 *	Fonction pour supprimer le démineur
	 *	Arrête le chronomètre et efface le tableau ainsi que le message de fin de partie
	 **/
	Demineur.prototype.supr = function()
	{
		this.chrono.stop();
		
		document.getElementById('tab').innerHTML = "";
		document.getElementById('fin').innerHTML = "";
	}
	
	/**
	 *	Initialise la grille du démineur : tableau de deux dimensions (hauteur/largeur) contenant les Cases 
	 **/
	Demineur.prototype.initCase = function()
	{
		for (var i = 0; i < hauteur; ++i)
			this.grille[i] = new Array(largeur);
		
		for (var i = 0; i < this.hauteur; ++i)
			for (var y = 0; y < this.largeur; ++y)
				this.grille[i][y] = new Case(i, y);
	}
	
	/**
	 *	Fonction utilisée par Case.devoileCase() quand la dernière Case ne contenant pas de bombe est dévoilée
	 *	Arrête le démineur et affiche une message de félicitation
	 **/
	Demineur.prototype.gagne = function()
	{
		/**
		 * Div où sera affiché le message de félicitation
		 **/
		var div = document.getElementById('fin');
		
		joue = false; // On arrête le jeu
		this.chrono.stop(); // On arrête le chronomètre

		div.innerHTML = '<strong>Félicitation !</strong></br>';
		div.innerHTML += 'Vous avez trouvez les '+ this.bombe +' bombes en ';
		
		// On ajuste le message en fonction du temps réalisé
		if (this.chrono.min > 0)
			div.innerHTML += this.chrono.min + ' minute' + ((this.chrono.min == 1)?'':'s') + ' et ';
		
		div.innerHTML +=  this.chrono.sec + ' seconde' + ((this.chrono.sec == 1)?'.':'s.');
	}
	
	/**
	 *	Fonction utilisée par Case.devoileCase() si la case cliquée contenait une bombe
	 *	Arrête le jeu et affiche une phrase l'expliquant
	 **/
	Demineur.prototype.perdu = function()
	{
		/**
		 *	Div où l'on va afficher le texte de fin : #fin
		 **/
		var div = document.getElementById('fin');
		
		joue = false; // La partie est terminée
		this.chrono.stop(); // On arrete le chronomètre
		
		for (var i = 0; i < this.hauteur; ++i)
			for (var j = 0; j < this.largeur; ++j)
				if (this.grille[i][j].etat != 1) // Si la Case n'a pas été dévoilée
					this.grille[i][j].devoileFin();
		
		div.innerHTML = '<strong>Dommage ...</strong></br>';
		div.innerHTML += 'Vous n\'avez pas réussi à trouver les '+ this.bombe +' bombes.';
	}
	
	/**
	 *	Fonction utilisée pour dessiner le démineur dans la balise #tab
	 **/
	Demineur.prototype.paint = function()
	{
		/**
		 *	(int) Largeur de l'entete #bombe : moité de la taille du tableau
		 **/
		var largBombe = parseInt(this.largeur / 2);
		/**
		 *	(int) Largeur de l'entete #chrono : l'autre moité du tableau
		 **/
		var largChrono = this.largeur - largBombe;
		/**
		 *	Division prevue pour contenir le démineur, #tab
		 **/
		var div = document.getElementById('tab');
		/**
		 *	Contenu à mettre dans #tab
		 **/
		var texte;
		
		texte = '<table border="5" cellpadding="10" cellspacing="0">';
		texte += '<thead><tr><th colspan="'+ largBombe +'"><img class="imagebombedemineur" src="images/bombe.png" ><span id="bombe">' + this.bombeRest + '</span></th><th class="last" colspan="'+ largChrono +'"><span id="chrono">0</span><img class="timer" src="images/timer.png"></th></tr></thead>';
		for (var i = 0; i < this.hauteur; ++i) {
			texte += '<tr>';
			for(var j = 0; j < this.largeur; ++j)
				texte += '<td id="'+ getTwoNumber(i) + getTwoNumber(j) +'" class="unknown" onClick="demineur.grille['+ i +']['+ j +'].devoileCase();" oncontextmenu="demineur.grille['+ i +']['+ j +'].placeDrapeau(); return false;"></td>';
			texte += '</tr>';
		}
		texte += '</table>';
	
		// On met le contenu de #tab à jour
		div.innerHTML = texte;
	}
	
	/**
	 * Fonction servant à placer les bombes dans les Cases
	 **/
	this.placeBombe = function()
	{
		var x = 0, y = 0;
		for (var i = 0; i < this.bombe; i++) {
			x = Math.floor(Math.random() * this.largeur);
			y = Math.floor(Math.random() * this.hauteur);
			
			if (!this.grille[y][x].bombe) // Si la Case selectionnée ne contient pas encore de bombe, on lui en met une
				this.grille[y][x].bombe = true;
			else // Sinon on annule le tour : aucune bombe n'a été placée
				i--;
		}
	}
	
}

/**
 * Case : une Case représente une case dans le démineur
 * A pour coordonnée (ligne;colonne)
 * Contient ou non une bombe
 *
 *	@param ligne 	Ordonnée de la case
 *	@param colonne	Abscisse de la case
 **/
function Case(ligne, colonne)
{
	/**
	 * Ordonnée de la case, de 0 à n, 0 étant le plus haut et n le plus bas
	 **/
	this.ligne = ligne;
	/**
	 *	Abscisse de la case, de 0 à n, 0 étant le plus à gauche et n le plus à droite
	 **/
	this.colonne = colonne;
	
	/****************************************
	* 0 - non cliquer
	* 1 - deja clic
	* 2 - bloquer (clic droit)
	*****************************************/
	this.etat = 0;
	this.bombe = false;
	
	/**
	 *	Fonction utilisée lorsque l'utilisateur fait un clic gauche sur la Case
	 *	Devoile la case : affiche la bombe où indique le nombre de bombe autour
	 **/
	Case.prototype.devoileCase = function()
	{
		if (joue && this.etat == 0)	{ // Si la partie n'est pas finie, et que la Case n'a pas été dévoilée ou n'est pas bloquée
			if (this.bombe)	// Si la case contient une bombe
				demineur.perdu();
			else { 
				// Pas de bombe dans la case		
				if (!demineur.chronoStart) { 
					// On lance le chrono seulement si on tombe pas sur une bombe
					demineur.chronoStart = true;
					demineur.chrono.start();
				}
				
				this.etat = 1; // La case est maintenant dévoilée
				document.getElementById(getTwoNumber(this.ligne)+ "" +getTwoNumber(this.colonne)).classList.remove("unknown");
				demineur.caseDevoile++;
				if (this.returnBombe() != 0) // Si il y a une bombe dans les Cases adjacentes
					document.getElementById(getTwoNumber(this.ligne)+ "" +getTwoNumber(this.colonne)).innerHTML = "<span class=\"class"+this.returnBombe() + "\">" + this.returnBombe() + "</span>";
				else { // Sinon on devoile les cases autour
					document.getElementById(getTwoNumber(this.ligne) + "" + getTwoNumber(this.colonne)).innerHTML = "";
					for (var y = -1; y <= 1; ++y)
						for (var x = -1; x <= 1; ++x)
							if (this.ligne + x >= 0 && this.ligne + x <= demineur.hauteur -1 && this.colonne + y >=0 && this.colonne + y <= demineur.largeur - 1)
								demineur.grille[(this.ligne + x)][(this.colonne + y)].devoileCase();
				}
			}
			
			if (demineur.bombeRest >= 0 && demineur.caseDevoile + demineur.bombe == demineur.largeur * demineur.hauteur) // Si il n'y a plus de Case a dévoilée à part les bombes on a gagné la partie
				demineur.gagne();
		}
	}
	
	/**
	 *	Fonction utilisée par Demineur.perdu()
	 *	Devoile la Case en fin de partie, affiche les bombes et les Cases bloquées sans bombes
	 **/
	Case.prototype.devoileFin = function()
	{
		if (this.bombe)
			// Si il y a une bombe dans la Case
			document.getElementById(getTwoNumber(this.ligne) + "" + getTwoNumber(this.colonne)).innerHTML = "<img class=\"explosion\" src=\"images/bombe.png\" />";
		else if (this.etat == 2) 
			// Si il n'y a pas de bombe mais que la Case était bloquée
			document.getElementById(getTwoNumber(this.ligne) + "" + getTwoNumber(this.colonne)).innerHTML = "<img src=\"images/drapeauFaux.png\" />";
		else { 
			//Sinon c'est un case vide
			this.etat = 1;
			if (this.returnBombe() != 0)
				document.getElementById(getTwoNumber(this.ligne) + "" + getTwoNumber(this.colonne)).innerHTML = "<span class=\"class" + this.returnBombe() + "\">" + this.returnBombe() + "</span>";
			else
				document.getElementById(getTwoNumber(this.ligne) + "" + getTwoNumber(this.colonne)).innerHTML = "";
		}
	}
	
	/**
	 *	Fonction appelée lorsque l'utilisateur fait un clic droit sur la case
	 *	Bloque ou débloque la case selon son état et place un drapeau en conséquence
	 **/
	Case.prototype.placeDrapeau = function()
	{
		if (joue) {
			// Si la partie n'est pas terminée
			if (this.etat == 0)	{ 
			// Si la case n'est pas bloquée on la bloque
				this.etat = 2;
				demineur.bombeRest--;
				document.getElementById(getTwoNumber(this.ligne) + "" + getTwoNumber(this.colonne)).innerHTML = "<img src=\"images/drapeau.png\"/>";
			} else if (this.etat == 2) { //Si la case est déjà bloquée on la débloque
				this.etat = 0;
				demineur.bombeRest++;
				document.getElementById(getTwoNumber(this.ligne) + "" + getTwoNumber(this.colonne)).innerHTML = "";
			}
			document.getElementById("bombe").innerHTML = demineur.bombeRest;
		}
	}
	
	/**
	 * Fonction appelée par Case.devoileCase()
	 * Trouve le nombre de bombes situées dans les cases adjacentes
	 *
	 *	@return Nombre de bombes trouvé
	 **/
	this.returnBombe = function()
	{
		var bombe = 0;
		for (var y = -1; y <= 1; ++y)
			for (var x = -1; x <=1 ; ++x)
				if (this.ligne + x >= 0 && this.ligne + x <= demineur.hauteur -1 && this.colonne + y >= 0 && this.colonne + y <= demineur.largeur -1)
					if (demineur.grille[ligne + x][colonne + y].bombe == true)
						++bombe;
		return bombe;
	}
}

/**
 * Chronomètre
**/
function Chrono()
{
	this.startTime = 0;
	this.end = 0;
	this.diff = 0;
	this.timerID = 0;
	
	/**
	 *	Nombre de secondes écoulées
	**/
	this.sec = 0;
	/**
	 * Nombre de minutes écoulées
	**/
	this.min = 0;
	
	/**
	 * Calcule le temps écoulé depuis le lancement du chronomètre
	**/
	this.refresh = function()
	{
		end = new Date();
		diff = end - startTime;
		diff = new Date(diff);
		var sec = this.sec = diff.getSeconds();
		var min = this.min = diff.getMinutes();
		if (this.min == 0)
			min = "";
		else {
			if (this.sec < 10)
				sec = "0" + this.sec;
			min = this.min + "'";
		}
		document.getElementById("chrono").innerHTML = min + sec;
		timerID = setTimeout("demineur.chrono.refresh()", 10);
	}
	
	/**
	 * Demare le chronomètre
	**/
	this.start = function()
	{
		startTime = new Date();
		this.refresh();
	}
	
	/**
	 *	Arrete le chronomètre
	**/
	this.stop = function()
	{
		if (this.sec != 0) {
			// On arrete le timer seulement si il est lancé
			clearTimeout(timerID);
		}
	}
}

	
/**
 * 	Fonction activée par startEasy(), startMedium(), startHard() et reStart()
 *	Lance le démineur
 *	
 *	@param ligne 	Hauteur du démineur (en nombre de ligne)
 *	@param colonne	Largeur du démineur (en nombre de colonne)
 *	@param bombe 	Nombre de bombe dans le démineur
**/
function start(ligne, colonne, bombe)
{
	// Si un démineur existe déja on le supprime
	if (demineur)
		demineur.supr();
	
	// Et on lance le demineur
	joue = true;
	demineur = new Demineur(ligne, colonne, bombe);
	demineur.initCase();
	demineur.placeBombe();
	demineur.paint();
}

/**
 * 	Fonction activée au chargement de la page et lorsque l'utilisateur clique sur le bouton difficile
 *	Lance une partie avec les paramètres difficiles
**/
function startEasy()
{
	start(9, 9, 10);
}

/**
 *	Fonction activée lorsque l'utilisateur clique sur le bouton moyen
 *	Lance une partie avec les paramètres moyens
**/
function startMedium()
{
	start(16, 16, 40);
}

/**
 *	Fonction activée lorsque l'utilisateur clique sur le bouton difficil
 *	Lance une partie avec les paramètres difficils
**/
function startHard()
{
	start(16, 30, 99);
}

/**
 * Fonction activée lorsque l'utilisateur clique sur le bouton perso
 * Lance une partie avec les paramètre entré par l'utilisateur
 **/
function startPerso()
{
	ligne = prompt("Nombre de ligne ?");
    colonne = prompt("Nombre de colonne ?");
	bombe = prompt("Nombre de bombe ?");

	start(ligne, colonne, 2);
}

/**
 *	Fonction activée lorsque l'utilisateur clique sur le bouton reStart
 * 	Relance un demineur avec les memes parametres
**/
function reStart()
{
	start(demineur.hauteur, demineur.largeur, demineur.bombe);
}

/**
 *	Ajoute un zéro si le nombre est inférieur à 10 pour avoir deux caractères
 *	
 *	@param number Nombre à tester
 *	
 * 	@return Le nombre sur deux caractères au minimun
**/
function getTwoNumber(number)
{
	if (number < 10)
		number = '0' + number;
	
	return number;
}

/**	MAIN **/

// Gestion des events
	// On initialise le clic gauche du bouton redemarer
	document.getElementById('reStart').addEventListener('click', reStart, false);
	
	// Les boutons de dificulté
	document.getElementById('facile').addEventListener('click', startEasy, false);
	document.getElementById('moyen').addEventListener('click', startMedium, false);
	document.getElementById('difficile').addEventListener('click', startHard, false);
	document.getElementById('perso').addEventListener('click', startPerso, false);

var joue = false;
var demineur;

startEasy();
