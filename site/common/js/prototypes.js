Number.prototype.pluralForm = function (root, suffix_list) {
    return root + (this >= 11 && this <= 14 ? suffix_list[0] : suffix_list[this % 10]);
}
Number.prototype.asDays = function () {
    const n = Math.floor(this);
    return n.pluralForm('д', ['ней', 'ень', 'ня', 'ня', 'ня', 'ней', 'ней', 'ней', 'ней', 'ней']);
};
Number.prototype.asNights = function () {
    const n = Math.floor(this);
    return n.pluralForm('ноч', ['ей', 'ь', 'и', 'и', 'и', 'ей', 'ей', 'ей', 'ей', 'ей']);
};

Number.prototype.formatPrice = function(prefix, suffix) {
    var s;
    s = String(Math.round(this));
    var sum = s.split('').reverse().join('').replace(/\d{3}(?=\d)/g, "$& ").split('').reverse().join('');
    return `${ prefix ? (prefix + ' ') : '' }${ sum }${ suffix ? (' ' + suffix) : '' }`;
};

Number.prototype.formatCurrency = function (code = 'RUB') {
    return {
        RUB: this.formatPrice('', '₽'),
        EUR: this.formatPrice('€', ''),
        USD: this.formatPrice('$', '')
    }[code];
};

export default null;