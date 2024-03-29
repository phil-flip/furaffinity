"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const fast_html_parser_1 = __importDefault(require("fast-html-parser"));
const Enums_1 = require("./Enums");
const _1 = require(".");
;
function ParseFigure(figure, type) {
    let id = figure.id.split('-').pop();
    let thumb = 'https:' + (/src="([\s\S]+?)"/.exec(figure.childNodes[0].childNodes[0].childNodes[0].childNodes[0].rawAttrs) || [])[1];
    let url = 'https://www.furaffinity.net/user/' + figure.classNames[2];
    let name = figure.classNames[2];
    if (figure.childNodes[1].childNodes[1]) {
        url = 'https://www.furaffinity.net' + (/href="([\s\S]+?)"/.exec(figure.childNodes[1].childNodes[1].childNodes[2].rawAttrs) || [])[1];
        name = figure.childNodes[1].childNodes[1].childNodes[2].childNodes[0].rawText;
    }
    return {
        type,
        id,
        // title: figure.childNodes[1].childNodes[0].childNodes[0].childNodes[0].rawText,
        title: figure.childNodes[1].childNodes[0].childNodes[0].rawText,
        url: 'https://www.furaffinity.net/view/' + id,
        thumb: {
            icon: thumb.replace(/@\d+?-/g, '@75-'),
            tiny: thumb.replace(/@\d+?-/g, '@150-'),
            small: thumb.replace(/@\d+?-/g, '@300-'),
            medium: thumb.replace(/@\d+?-/g, '@800-'),
            large: thumb.replace(/@\d+?-/g, '@1600-')
        },
        author: {
            url,
            name
        },
        getSubmission: () => __awaiter(this, void 0, void 0, function* () {
            return yield _1.Submission(id, figure);
        })
    };
}
exports.ParseFigure = ParseFigure;
;
function ParseIndex(body, type) {
    let root = fast_html_parser_1.default.parse(body);
    let sections = root.querySelectorAll('section');
    let results = [];
    let types = [Enums_1.Type.Artwork, Enums_1.Type.Writing, Enums_1.Type.Music, Enums_1.Type.Crafts];
    // @ts-ignore
    sections.forEach((section, i) => {
        if (type && types[i] != type)
            return;
        // @ts-ignore
        section.childNodes.forEach(figure => {
            if (figure.classNames) {
                results.push(ParseFigure(figure, types[i]));
            }
        });
    });
    return results;
}
exports.ParseIndex = ParseIndex;
;
function ParseNotifications(body) {
    let root = fast_html_parser_1.default.parse(body);
    let sections = root.querySelectorAll('form')[1];
    let results = [];
    // @ts-ignore
    sections.childNodes.forEach(section => {
        if (section.id) {
            section.childNodes.forEach(figure => {
                if (figure.classNames) {
                    figure.classNames.push(figure.structuredText.split('by ').pop());
                    results.push(ParseFigure(figure, Enums_1.Type.Any));
                }
            });
        }
    });
    return results;
}
exports.ParseNotifications = ParseNotifications;
;
function ParseSearch(body, options) {
    let root = fast_html_parser_1.default.parse(body);
    let figures = root.querySelectorAll('figure');
    let results = [];
    // @ts-ignore
    figures.forEach(figure => {
        if (figure.classNames) {
            let type = Enums_1.Type.Any;
            if (options && options.type)
                type = options.type;
            results.push(ParseFigure(figure, type));
        }
    });
    return results;
}
exports.ParseSearch = ParseSearch;
;
function ParseBrowse(body) {
    let root = fast_html_parser_1.default.parse(body);
    let figures = root.querySelectorAll('figure');
    let results = [];
    // @ts-ignore
    figures.forEach(figure => {
        if (figure.classNames) {
            results.push(ParseFigure(figure, Enums_1.Type.Any));
        }
    });
    return results;
}
exports.ParseBrowse = ParseBrowse;
;
;
function ParseSubmission(body, id, figure) {
    let root = fast_html_parser_1.default.parse(body);
    let table = root.querySelector('.maintable');
    if (table.childNodes[1].childNodes[1].childNodes[1])
        throw new Error('This submission cannot be viewed, this may be because the owner requires you to login, you haven\'t logged in to view mature content or you have not enabled mature content.');
    let main = table.childNodes[3].childNodes[1];
    let info = main.childNodes[22];
    if (main.childNodes[20].childNodes[1]) info = main.childNodes[20]; // info .maintable
    else if (main.childNodes[22].childNodes[1]) info = main.childNodes[22]; // info .maintable
    let header = info.childNodes[1].childNodes[1].childNodes; // title of info table
    let stats;
    if (info.childNodes[1].childNodes[3].childNodes[1].childNodes[1].childNodes[1].childNodes[42]) stats = info.childNodes[1].childNodes[3].childNodes[1].childNodes[1].childNodes[1].childNodes; // stats container
    else if (info.childNodes[1].childNodes[3].childNodes[1].childNodes[3].childNodes[1].childNodes[42]) stats = info.childNodes[1].childNodes[3].childNodes[1].childNodes[3].childNodes[1].childNodes; // stats container
    let res = stats[42].rawText.trim().split('x'); // res
    let rating = figure.classNames[0].split('-').pop();
    if (stats[55]) rating = Enums_1.Rating[(/alt="([\s\S]+?) rating"/g.exec(stats[55].childNodes[1].rawAttrs) || '')[1]];
    let artist = header[1].childNodes[3].childNodes[3].rawText.trim();
    let keywords = ['none'];
    if (stats[49]) keywords = stats[49].childNodes.filter(x => { return !!x.tagName; }).map(x => { return x.childNodes[0].rawText; });
    return {
        id,
        url: 'https://www.furaffinity.net/view/' + id,
        title: header[1].childNodes[0].rawText.trim(),
        posted: (/title="([\s\S]+?)"/g.exec(stats[6].rawAttrs) || '')[1],
        // @ts-ignore
        rating,
        // rating: figure.classNames[0].split('-').pop(),
        author: {
            // url: 'https://www.furaffinity.net/user/' + header[3].childNodes[0].rawText.trim(),
            url: 'https://www.furaffinity.net/user/' + artist,
            name: artist
        },
        content: {
            // @ts-ignore
            category: Enums_1.Category[stats[10].rawText.trim()],
            // @ts-ignore
            species: Enums_1.Species[stats[18].rawText.trim()],
            // @ts-ignore
            gender: Enums_1.Gender[stats[22].rawText.trim()]
        },
        stats: {
            favorites: parseInt(stats[26].rawText.trim()),
            comments: parseInt(stats[30].rawText.trim()),
            views: parseInt(stats[34].rawText.trim())
        },
        image: {
            url: 'https:' + (/src="([\s\S]+?)"/g.exec(main.childNodes[5].rawAttrs) || '')[1],
            width: res[0],
            height: res[1]
        },
        // @ts-ignore
        keywords,
    };
}
exports.ParseSubmission = ParseSubmission;
;
